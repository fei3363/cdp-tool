"""截圖與 DOM 操作範例"""

import asyncio
import sys
sys.path.insert(0, str(__import__("pathlib").Path(__file__).parent.parent))

from cdp import Browser, Page, JSExecutor


async def main():
    browser = Browser(port=9222)
    await browser.connect_existing()

    conn = await browser.get_page()
    page = Page(conn)
    js = JSExecutor(conn)

    await page.navigate("https://example.com")

    # DOM 查詢
    h1_node = await page.query_selector("h1")
    print(f"h1 nodeId: {h1_node}")

    all_links = await page.query_selector_all("a")
    print(f"找到 {len(all_links)} 個連結")

    # 用 JS 取得元素內容
    h1_text = await js.evaluate_value('document.querySelector("h1").textContent')
    print(f"h1 內容: {h1_text}")

    # 修改頁面內容後截圖
    await js.evaluate('''
        document.querySelector("h1").textContent = "CDP 工具測試";
        document.querySelector("h1").style.color = "red";
    ''')

    await page.screenshot(path="modified.png")
    print("修改後截圖: modified.png")

    # 注入 CSS
    await js.evaluate('''
        const style = document.createElement("style");
        style.textContent = "body { background: #1a1a2e; color: #eee; }";
        document.head.appendChild(style);
    ''')

    await page.screenshot(path="dark_mode.png")
    print("暗色模式截圖: dark_mode.png")

    await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
