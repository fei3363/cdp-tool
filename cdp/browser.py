"""Chrome 瀏覽器啟動與連線管理"""

import asyncio
import json
import shutil
import subprocess
import urllib.request
from pathlib import Path

from .connection import CDPConnection


class Browser:
    """管理 Chrome 程序生命週期並提供 CDP 連線"""

    # 常見 Chrome 路徑（Windows）
    CHROME_PATHS = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        Path.home() / "AppData" / "Local" / "Google" / "Chrome" / "Application" / "chrome.exe",
    ]

    def __init__(self, port: int = 9222, headless: bool = False):
        self.port = port
        self.headless = headless
        self._process: subprocess.Popen | None = None
        self._connections: list[CDPConnection] = []

    @classmethod
    def find_chrome(cls) -> str | None:
        """自動偵測 Chrome 執行檔路徑"""
        for path in cls.CHROME_PATHS:
            if Path(path).exists():
                return str(path)
        found = shutil.which("chrome") or shutil.which("google-chrome")
        return found

    async def launch(self, chrome_path: str | None = None, user_data_dir: str | None = None):
        """啟動 Chrome 並開啟 debug port"""
        chrome = chrome_path or self.find_chrome()
        if not chrome:
            raise FileNotFoundError("找不到 Chrome，請指定 chrome_path")

        args = [
            chrome,
            f"--remote-debugging-port={self.port}",
            "--no-first-run",
            "--no-default-browser-check",
        ]
        if self.headless:
            args.append("--headless=new")
        if user_data_dir:
            args.append(f"--user-data-dir={user_data_dir}")

        self._process = subprocess.Popen(
            args,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

        # 等待 debug port 就緒
        for _ in range(30):
            try:
                await self.get_targets()
                return self
            except Exception:
                await asyncio.sleep(0.5)
        raise TimeoutError(f"Chrome debug port {self.port} 啟動逾時")

    async def connect_existing(self):
        """連接到已經開啟 debug port 的 Chrome"""
        await self.get_targets()
        return self

    async def get_targets(self) -> list[dict]:
        """取得所有可除錯的 target（分頁）"""
        url = f"http://127.0.0.1:{self.port}/json"
        loop = asyncio.get_event_loop()
        resp = await loop.run_in_executor(
            None, lambda: urllib.request.urlopen(url, timeout=3).read()
        )
        return json.loads(resp)

    async def get_page(self, target_idx: int = 0) -> "CDPConnection":
        """取得指定分頁的 CDP 連線"""
        targets = await self.get_targets()
        pages = [t for t in targets if t.get("type") == "page"]
        if not pages:
            raise RuntimeError("沒有可用的分頁")
        if target_idx >= len(pages):
            raise IndexError(f"分頁索引 {target_idx} 超出範圍（共 {len(pages)} 個分頁）")

        ws_url = pages[target_idx]["webSocketDebuggerUrl"]
        conn = CDPConnection(ws_url)
        await conn.connect()
        self._connections.append(conn)
        return conn

    async def new_tab(self, url: str = "about:blank") -> "CDPConnection":
        """開新分頁並回傳 CDP 連線"""
        encoded = urllib.parse.quote(url, safe=":/?#[]@!$&'()*+,;=")
        put_url = f"http://127.0.0.1:{self.port}/json/new?{encoded}"
        loop = asyncio.get_event_loop()
        resp = await loop.run_in_executor(
            None, lambda: urllib.request.urlopen(put_url, timeout=3).read()
        )
        target = json.loads(resp)
        ws_url = target["webSocketDebuggerUrl"]
        conn = CDPConnection(ws_url)
        await conn.connect()
        self._connections.append(conn)
        return conn

    async def close(self):
        """關閉所有連線，如果是自己啟動的 Chrome 也一併關閉"""
        for conn in self._connections:
            await conn.disconnect()
        self._connections.clear()
        if self._process:
            self._process.terminate()
            self._process.wait(timeout=5)
            self._process = None

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        await self.close()
