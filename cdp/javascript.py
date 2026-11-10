"""JavaScript 執行與 Console 監聽"""

import asyncio
from dataclasses import dataclass

from .connection import CDPConnection


@dataclass
class ConsoleMessage:
    """Console 訊息"""
    level: str  # log, warning, error, info, debug
    text: str
    url: str | None = None
    line: int | None = None


class JSExecutor:
    """在頁面中執行 JavaScript 並監聽 Console"""

    def __init__(self, conn: CDPConnection):
        self._conn = conn
        self.console_messages: list[ConsoleMessage] = []
        self._console_enabled = False

    async def evaluate(self, expression: str, await_promise: bool = False) -> dict:
        """執行 JavaScript 表達式，回傳結果

        回傳格式: {"type": "string", "value": "..."} 或 {"type": "object", ...}
        """
        params = {
            "expression": expression,
            "returnByValue": True,
        }
        if await_promise:
            params["awaitPromise"] = True

        result = await self._conn.send("Runtime.evaluate", params)

        if "exceptionDetails" in result:
            exc = result["exceptionDetails"]
            text = exc.get("text", "")
            exception = exc.get("exception", {})
            desc = exception.get("description", text)
            raise JavaScriptError(desc)

        return result.get("result", {})

    async def evaluate_value(self, expression: str, await_promise: bool = False):
        """執行 JS 並直接回傳 Python 值"""
        result = await self.evaluate(expression, await_promise)
        return result.get("value")

    async def call_function(self, function_declaration: str, args: list | None = None) -> dict:
        """呼叫 JavaScript 函式"""
        params = {
            "functionDeclaration": function_declaration,
            "returnByValue": True,
        }
        if args:
            params["arguments"] = [{"value": a} for a in args]

        result = await self._conn.send("Runtime.callFunctionOn", params)
        return result.get("result", {})

    async def inject_script(self, script: str):
        """注入 JavaScript（每次頁面載入時自動執行）"""
        await self._conn.send(
            "Page.addScriptToEvaluateOnNewDocument",
            {"source": script},
        )

    # --- Console 監聽 ---

    async def enable_console(self):
        """啟用 Console 訊息監聽"""
        if self._console_enabled:
            return
        await self._conn.send("Runtime.enable")
        self._conn.on("Runtime.consoleAPICalled", self._on_console)
        self._console_enabled = True

    def _on_console(self, params: dict):
        """處理 Console 訊息"""
        level = params.get("type", "log")
        args = params.get("args", [])
        texts = []
        for arg in args:
            if "value" in arg:
                texts.append(str(arg["value"]))
            elif "description" in arg:
                texts.append(arg["description"])
            else:
                texts.append(str(arg))

        msg = ConsoleMessage(
            level=level,
            text=" ".join(texts),
            url=params.get("stackTrace", {}).get("callFrames", [{}])[0].get("url"),
            line=params.get("stackTrace", {}).get("callFrames", [{}])[0].get("lineNumber"),
        )
        self.console_messages.append(msg)

    def get_console(self, level: str | None = None) -> list[ConsoleMessage]:
        """取得 Console 訊息，可依 level 篩選"""
        if level:
            return [m for m in self.console_messages if m.level == level]
        return list(self.console_messages)

    def clear_console(self):
        """清除已記錄的 Console 訊息"""
        self.console_messages.clear()

    # --- 實用工具 ---

    async def wait_for_condition(
        self, js_expression: str, timeout: float = 10, interval: float = 0.3
    ) -> bool:
        """等待 JS 條件成立"""
        deadline = asyncio.get_event_loop().time() + timeout
        while asyncio.get_event_loop().time() < deadline:
            result = await self.evaluate_value(js_expression)
            if result:
                return True
            await asyncio.sleep(interval)
        return False


class JavaScriptError(Exception):
    pass
