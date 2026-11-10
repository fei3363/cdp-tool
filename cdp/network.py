"""網路請求攔截與監聽"""

import asyncio
import base64
from dataclasses import dataclass, field

from .connection import CDPConnection


@dataclass
class RequestEntry:
    """記錄一筆網路請求"""
    request_id: str
    url: str
    method: str
    headers: dict = field(default_factory=dict)
    post_data: str | None = None
    status: int | None = None
    response_headers: dict = field(default_factory=dict)
    response_body: bytes | None = None


class NetworkMonitor:
    """監聽與攔截網路請求"""

    def __init__(self, conn: CDPConnection):
        self._conn = conn
        self.requests: dict[str, RequestEntry] = {}
        self._intercept_handler = None
        self._enabled = False

    async def enable(self):
        """啟用網路監聽"""
        if self._enabled:
            return
        await self._conn.send("Network.enable")
        self._conn.on("Network.requestWillBeSent", self._on_request)
        self._conn.on("Network.responseReceived", self._on_response)
        self._enabled = True

    async def disable(self):
        """停用網路監聽"""
        await self._conn.send("Network.disable")
        self._enabled = False

    def _on_request(self, params: dict):
        """處理發出的請求"""
        req = params["request"]
        entry = RequestEntry(
            request_id=params["requestId"],
            url=req["url"],
            method=req["method"],
            headers=req.get("headers", {}),
            post_data=req.get("postData"),
        )
        self.requests[params["requestId"]] = entry

    def _on_response(self, params: dict):
        """處理收到的回應"""
        entry = self.requests.get(params["requestId"])
        if entry:
            resp = params["response"]
            entry.status = resp.get("status")
            entry.response_headers = resp.get("headers", {})

    async def get_response_body(self, request_id: str) -> bytes:
        """取得指定請求的回應 body"""
        result = await self._conn.send(
            "Network.getResponseBody", {"requestId": request_id}
        )
        if result.get("base64Encoded"):
            return base64.b64decode(result["body"])
        return result["body"].encode("utf-8")

    def filter_requests(
        self,
        url_contains: str | None = None,
        method: str | None = None,
        status: int | None = None,
    ) -> list[RequestEntry]:
        """篩選已記錄的請求"""
        results = list(self.requests.values())
        if url_contains:
            results = [r for r in results if url_contains in r.url]
        if method:
            results = [r for r in results if r.method == method.upper()]
        if status:
            results = [r for r in results if r.status == status]
        return results

    async def clear(self):
        """清除已記錄的請求"""
        self.requests.clear()

    # --- 請求攔截（Fetch domain）---

    async def enable_interception(self, url_pattern: str = "*"):
        """啟用請求攔截，可修改或阻擋請求"""
        await self._conn.send(
            "Fetch.enable",
            {"patterns": [{"urlPattern": url_pattern}]},
        )
        self._conn.on("Fetch.requestPaused", self._on_paused)

    async def disable_interception(self):
        """停用請求攔截"""
        await self._conn.send("Fetch.disable")

    def set_intercept_handler(self, handler):
        """設定攔截處理函式

        handler(request_info: dict) -> dict | None
            回傳 None 表示放行原始請求
            回傳 dict 可包含 {"url", "method", "headers", "postData"} 修改請求
            回傳 {"fulfill": True, "status": 200, "body": "...", "headers": [...]} 直接回應
        """
        self._intercept_handler = handler

    async def _on_paused(self, params: dict):
        """處理被攔截的請求"""
        request_id = params["requestId"]

        if self._intercept_handler:
            result = self._intercept_handler(params)
            if asyncio.iscoroutine(result):
                result = await result

            if result and result.get("fulfill"):
                body = result.get("body", "")
                encoded = base64.b64encode(body.encode()).decode() if isinstance(body, str) else base64.b64encode(body).decode()
                await self._conn.send(
                    "Fetch.fulfillRequest",
                    {
                        "requestId": request_id,
                        "responseCode": result.get("status", 200),
                        "responseHeaders": result.get("headers", []),
                        "body": encoded,
                    },
                )
                return

            if result:
                await self._conn.send(
                    "Fetch.continueRequest",
                    {"requestId": request_id, **result},
                )
                return

        # 預設放行
        await self._conn.send("Fetch.continueRequest", {"requestId": request_id})
