"""網路請求監聽與攔截範例"""

import asyncio
import sys
sys.path.insert(0, str(__import__("pathlib").Path(__file__).parent.parent))

from cdp import Browser, Page, NetworkMonitor


async def main():
    browser = Browser(port=9222)
    await browser.connect_existing()

    conn = await browser.get_page()
    page = Page(conn)
    network = NetworkMonitor(conn)

    # 啟用網路監聽
    await network.enable()

    # 導航並觀察請求
    await page.navigate("https://example.com")
    await asyncio.sleep(1)

    # 列出所有捕獲的請求
    print("=== 捕獲的請求 ===")
    for req_id, entry in network.requests.items():
        print(f"  [{entry.method}] {entry.url} -> {entry.status}")

    # 篩選特定請求
    html_reqs = network.filter_requests(url_contains=".html")
    print(f"\n符合 .html 的請求: {len(html_reqs)} 筆")

    # --- 攔截範例：修改回應 ---
    print("\n=== 請求攔截範例 ===")

    def intercept_handler(paused_request):
        """攔截請求並決定如何處理"""
        url = paused_request["request"]["url"]

        # 攔截特定 URL，回傳自訂內容
        if "example.com" in url and paused_request["request"]["method"] == "GET":
            print(f"  攔截: {url}")
            return {
                "fulfill": True,
                "status": 200,
                "headers": [
                    {"name": "Content-Type", "value": "text/html"},
                ],
                "body": "<h1>這個頁面被攔截了！</h1><p>由 CDP 工具注入的內容</p>",
            }

        # 其他請求放行
        return None

    await network.enable_interception("*example.com*")
    network.set_intercept_handler(intercept_handler)

    # 重新載入頁面，觸發攔截
    await page.navigate("https://example.com", wait_for_load=False)
    await asyncio.sleep(2)

    title = await page.get_title()
    print(f"攔截後的頁面標題: {title}")

    await network.disable_interception()
    await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
