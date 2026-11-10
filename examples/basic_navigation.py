"""基本導航與截圖範例"""

import asyncio
import sys
sys.path.insert(0, str(__import__("pathlib").Path(__file__).parent.parent))

from cdp import Browser, Page


async def main():
    browser = Browser(port=9222)

    # 連接到已開啟 debug port 的 Chrome
    # 啟動 Chrome 時加上: chrome.exe --remote-debugging-port=9222
    await browser.connect_existing()

    conn = await browser.get_page()
    page = Page(conn)

    # 導航
    await page.navigate("https://example.com")
    title = await page.get_title()
    url = await page.get_url()
    print(f"標題: {title}")
    print(f"URL: {url}")

    # 截圖
    await page.screenshot(path="example.png")
    print("截圖已儲存: example.png")

    # 整頁截圖
    await page.screenshot(path="example_full.png", full_page=True)
    print("整頁截圖已儲存: example_full.png")

    # 取得 HTML
    html = await page.get_html()
    print(f"HTML 長度: {len(html)} 字元")

    await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
