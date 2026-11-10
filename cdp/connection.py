"""CDP WebSocket 連線管理 — 負責 JSON-RPC 通訊與事件分發"""

import asyncio
import json
from typing import Any, Callable

import websockets


class CDPConnection:
    """透過 WebSocket 與 Chrome DevTools Protocol 通訊"""

    def __init__(self, ws_url: str):
        self._ws_url = ws_url
        self._ws = None
        self._msg_id = 0
        self._pending: dict[int, asyncio.Future] = {}
        self._event_handlers: dict[str, list[Callable]] = {}
        self._listener_task: asyncio.Task | None = None

    async def connect(self):
        self._ws = await websockets.connect(
            self._ws_url, max_size=50 * 1024 * 1024  # 50MB，截圖用
        )
        self._listener_task = asyncio.create_task(self._listen())
        return self

    async def disconnect(self):
        if self._listener_task:
            self._listener_task.cancel()
            try:
                await self._listener_task
            except asyncio.CancelledError:
                pass
        if self._ws:
            await self._ws.close()

    async def send(self, method: str, params: dict | None = None) -> Any:
        """發送 CDP 命令並等待回應"""
        self._msg_id += 1
        msg_id = self._msg_id
        message = {"id": msg_id, "method": method}
        if params:
            message["params"] = params

        future = asyncio.get_event_loop().create_future()
        self._pending[msg_id] = future
        await self._ws.send(json.dumps(message))
        return await future

    def on(self, event: str, handler: Callable):
        """註冊事件監聽器（如 Network.requestWillBeSent）"""
        self._event_handlers.setdefault(event, []).append(handler)

    def off(self, event: str, handler: Callable):
        """移除事件監聯器"""
        if event in self._event_handlers:
            self._event_handlers[event] = [
                h for h in self._event_handlers[event] if h is not handler
            ]

    async def _listen(self):
        """持續接收 WebSocket 訊息，分發回應與事件"""
        async for raw in self._ws:
            msg = json.loads(raw)

            # 命令回應
            if "id" in msg:
                future = self._pending.pop(msg["id"], None)
                if future and not future.done():
                    if "error" in msg:
                        future.set_exception(
                            CDPError(msg["error"]["code"], msg["error"]["message"])
                        )
                    else:
                        future.set_result(msg.get("result", {}))

            # 事件通知
            elif "method" in msg:
                for handler in self._event_handlers.get(msg["method"], []):
                    try:
                        result = handler(msg.get("params", {}))
                        if asyncio.iscoroutine(result):
                            await result
                    except Exception as e:
                        print(f"[CDP 事件處理錯誤] {msg['method']}: {e}")

    async def __aenter__(self):
        return await self.connect()

    async def __aexit__(self, *exc):
        await self.disconnect()


class CDPError(Exception):
    def __init__(self, code: int, message: str):
        self.code = code
        super().__init__(f"CDP Error {code}: {message}")
