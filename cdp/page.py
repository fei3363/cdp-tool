"""頁面操作 — 導航、截圖、DOM 查詢、Cookie 管理"""

import asyncio
import base64
from pathlib import Path

from .connection import CDPConnection


class Page:
    """封裝常用的頁面操作 CDP 命令"""

    def __init__(self, conn: CDPConnection):
        self._conn = conn

    async def enable(self):
        """啟用 Page domain 事件"""
        await self._conn.send("Page.enable")

    async def navigate(self, url: str, wait_for_load: bool = True) -> dict:
        """導航到指定 URL"""
        await self.enable()
        if wait_for_load:
            load_event = asyncio.get_event_loop().create_future()

            def on_load(params):
                if not load_event.done():
                    load_event.set_result(True)

            self._conn.on("Page.loadEventFired", on_load)
            result = await self._conn.send("Page.navigate", {"url": url})
            try:
                await asyncio.wait_for(load_event, timeout=30)
            except asyncio.TimeoutError:
                pass
            finally:
                self._conn.off("Page.loadEventFired", on_load)
        else:
            result = await self._conn.send("Page.navigate", {"url": url})
        return result

    async def reload(self, ignore_cache: bool = False):
        """重新載入頁面"""
        await self._conn.send("Page.reload", {"ignoreCache": ignore_cache})

    async def screenshot(
        self,
        path: str | None = None,
        fmt: str = "png",
        quality: int | None = None,
        full_page: bool = False,
    ) -> bytes:
        """截圖，回傳圖片 bytes，可選存檔"""
        params = {"format": fmt}
        if quality is not None:
            params["quality"] = quality
        if full_page:
            # 取得完整頁面尺寸
            layout = await self._conn.send("Page.getLayoutMetrics")
            content_size = layout.get("cssContentSize", layout.get("contentSize", {}))
            params["clip"] = {
                "x": 0,
                "y": 0,
                "width": content_size.get("width", 1920),
                "height": content_size.get("height", 1080),
                "scale": 1,
            }

        result = await self._conn.send("Page.captureScreenshot", params)
        data = base64.b64decode(result["data"])

        if path:
            Path(path).write_bytes(data)

        return data

    async def get_html(self) -> str:
        """取得頁面完整 HTML"""
        result = await self._conn.send(
            "Runtime.evaluate",
            {"expression": "document.documentElement.outerHTML"},
        )
        return result["result"]["value"]

    async def query_selector(self, selector: str) -> int | None:
        """查詢 DOM 元素，回傳 nodeId"""
        doc = await self._conn.send("DOM.getDocument", {"depth": -1})
        root_id = doc["root"]["nodeId"]
        result = await self._conn.send(
            "DOM.querySelector",
            {"nodeId": root_id, "selector": selector},
        )
        node_id = result.get("nodeId", 0)
        return node_id if node_id != 0 else None

    async def query_selector_all(self, selector: str) -> list[int]:
        """查詢所有符合的 DOM 元素"""
        doc = await self._conn.send("DOM.getDocument", {"depth": -1})
        root_id = doc["root"]["nodeId"]
        result = await self._conn.send(
            "DOM.querySelectorAll",
            {"nodeId": root_id, "selector": selector},
        )
        return result.get("nodeIds", [])

    async def click(self, selector: str):
        """點擊指定元素（透過 JS 模擬）"""
        await self._conn.send(
            "Runtime.evaluate",
            {
                "expression": f'document.querySelector("{selector}").click()',
                "awaitPromise": False,
            },
        )

    async def type_text(self, selector: str, text: str):
        """在指定元素輸入文字"""
        # 先 focus
        await self._conn.send(
            "Runtime.evaluate",
            {"expression": f'document.querySelector("{selector}").focus()'},
        )
        # 逐字輸入，模擬真實鍵盤
        for char in text:
            await self._conn.send(
                "Input.dispatchKeyEvent",
                {"type": "keyDown", "text": char},
            )
            await self._conn.send(
                "Input.dispatchKeyEvent",
                {"type": "keyUp", "text": char},
            )

    async def set_value(self, selector: str, value: str):
        """直接設定 input 值（快速模式，不模擬鍵盤）"""
        escaped = value.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")
        await self._conn.send(
            "Runtime.evaluate",
            {
                "expression": (
                    f'(() => {{'
                    f'  const el = document.querySelector("{selector}");'
                    f'  const nativeSetter = Object.getOwnPropertyDescriptor('
                    f'    window.HTMLInputElement.prototype, "value").set;'
                    f'  nativeSetter.call(el, "{escaped}");'
                    f'  el.dispatchEvent(new Event("input", {{bubbles: true}}));'
                    f'  el.dispatchEvent(new Event("change", {{bubbles: true}}));'
                    f'}})()'
                ),
            },
        )

    # --- Cookie 管理 ---

    async def get_cookies(self, urls: list[str] | None = None) -> list[dict]:
        """取得 Cookie"""
        params = {}
        if urls:
            params["urls"] = urls
        result = await self._conn.send("Network.getCookies", params)
        return result.get("cookies", [])

    async def set_cookie(self, name: str, value: str, domain: str, **kwargs):
        """設定 Cookie"""
        params = {"name": name, "value": value, "domain": domain, **kwargs}
        await self._conn.send("Network.setCookie", params)

    async def clear_cookies(self):
        """清除所有 Cookie"""
        await self._conn.send("Network.clearBrowserCookies")

    async def get_url(self) -> str:
        """取得目前頁面 URL"""
        result = await self._conn.send(
            "Runtime.evaluate", {"expression": "window.location.href"}
        )
        return result["result"]["value"]

    async def get_title(self) -> str:
        """取得頁面標題"""
        result = await self._conn.send(
            "Runtime.evaluate", {"expression": "document.title"}
        )
        return result["result"]["value"]

    async def wait_for_selector(self, selector: str, timeout: float = 10) -> bool:
        """等待元素出現"""
        deadline = asyncio.get_event_loop().time() + timeout
        while asyncio.get_event_loop().time() < deadline:
            node = await self.query_selector(selector)
            if node:
                return True
            await asyncio.sleep(0.3)
        return False
