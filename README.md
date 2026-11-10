# CDP Tool

透過 Chrome DevTools Protocol (CDP) 直接控制瀏覽器的命令列工具。

不依賴 Selenium、Playwright 等框架，直接透過 WebSocket 與 Chrome 通訊，適合資安測試、網頁自動化、CTF 解題與教學。

## 快速開始

### 1. 啟動 Chrome（開啟 debug port）

```bash
chrome.exe --remote-debugging-port=9222
```

### 2. 使用工具

**使用 exe（不需要 Python）：**

```bash
cdp-tool.exe info                              # 查看 Chrome 分頁
cdp-tool.exe screenshot https://example.com    # 截圖
cdp-tool.exe ss --full -o full.png             # 整頁截圖
cdp-tool.exe text https://example.com          # 擷取頁面文字
cdp-tool.exe links                             # 擷取所有連結
cdp-tool.exe cookies -o cookies.json           # 匯出 Cookie
cdp-tool.exe monitor --filter api              # 監聽網路請求
cdp-tool.exe js "document.title"               # 執行 JavaScript
cdp-tool.exe nav https://google.com            # 導航到 URL
```

**使用 Python：**

```bash
pip install -r requirements.txt
python cli.py info
```

### 3. 作為 Library 使用

```python
import asyncio
from cdp import Browser, Page, JSExecutor, NetworkMonitor

async def main():
    browser = Browser(port=9222)
    await browser.connect_existing()

    conn = await browser.get_page()
    page = Page(conn)
    js = JSExecutor(conn)

    await page.navigate("https://example.com")
    title = await page.get_title()
    print(f"標題: {title}")

    await page.screenshot(path="screenshot.png")
    await browser.close()

asyncio.run(main())
```

## 模組說明

| 模組 | 功能 |
|------|------|
| `connection.py` | WebSocket JSON-RPC 通訊、事件分發 |
| `browser.py` | Chrome 啟動/連接、分頁管理 |
| `page.py` | 導航、截圖、DOM 查詢、Cookie、表單輸入 |
| `network.py` | 網路請求監聽、請求攔截（Fetch domain） |
| `javascript.py` | JS 執行、Console 監聽、腳本注入 |

## 系統需求

- Google Chrome 瀏覽器
- 使用 exe：不需要其他依賴
- 使用 Python：Python 3.10+、websockets

## 授權

MIT License
