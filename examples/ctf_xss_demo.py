"""CTF XSS 解題輔助範例

示範如何用 CDP 工具：
1. 監聽 console.log 抓 flag
2. 注入 JS payload
3. 攔截請求觀察 exfiltration
4. Cookie 竊取模擬

注意：僅用於合法 CTF 競賽與資安教學
"""

import asyncio
import sys
sys.path.insert(0, str(__import__("pathlib").Path(__file__).parent.parent))

from cdp import Browser, Page, NetworkMonitor, JSExecutor


async def demo_console_capture(page: Page, js: JSExecutor):
    """監聽 console 輸出，常見 CTF flag 會印在 console"""
    print("\n=== Console 監聽 ===")
    await js.enable_console()

    # 模擬 CTF 題目會在 console 輸出 flag
    await js.evaluate('console.log("FLAG{cdp_is_powerful_2024}")')
    await js.evaluate('console.warn("hint: check the cookies")')
    await js.evaluate('console.error("debug: auth token expired")')

    for msg in js.get_console():
        prefix = {"log": "[*]", "warning": "[!]", "error": "[-]"}.get(msg.level, "[?]")
        print(f"  {prefix} {msg.text}")

    # 篩選特定 pattern
    flags = [m for m in js.get_console() if "FLAG{" in m.text]
    if flags:
        print(f"\n  🚩 找到 Flag: {flags[0].text}")


async def demo_cookie_inspection(page: Page):
    """檢查與操作 Cookie"""
    print("\n=== Cookie 檢查 ===")

    # 設定測試 Cookie
    await page.set_cookie("session", "admin_token_abc123", domain="example.com")
    await page.set_cookie("flag", "FLAG{cookie_monster}", domain="example.com")

    cookies = await page.get_cookies()
    for c in cookies:
        print(f"  {c['name']} = {c['value']}")
        if "flag" in c["name"].lower() or "FLAG{" in c["value"]:
            print(f"  🚩 Cookie 中的 Flag: {c['value']}")


async def demo_request_interception(page: Page, network: NetworkMonitor):
    """攔截請求，觀察 XSS payload 的 exfiltration"""
    print("\n=== 請求攔截（觀察 exfiltration）===")

    captured_data = []

    def intercept(paused):
        url = paused["request"]["url"]
        # 模擬攔截到 XSS 外傳的資料
        if "evil.com" in url or "webhook" in url:
            captured_data.append(url)
            print(f"  [!] 攔截到外傳請求: {url}")
            return {"fulfill": True, "status": 200, "body": "blocked"}
        return None

    await network.enable_interception("*")
    network.set_intercept_handler(intercept)

    # 模擬 XSS payload 試圖外傳 Cookie
    await page.navigate("https://example.com")
    # 注意：實際 CTF 中會是題目頁面

    await network.disable_interception()

    if captured_data:
        print(f"  共攔截 {len(captured_data)} 筆外傳請求")


async def demo_js_injection(page: Page, js: JSExecutor):
    """注入 JavaScript，常用於 XSS 測試"""
    print("\n=== JS 注入 ===")

    # 注入 keylogger（教學用途）
    await js.evaluate('''
        window._keylog = [];
        document.addEventListener("keydown", (e) => {
            window._keylog.push(e.key);
            console.log("[keylog] " + e.key);
        });
        console.log("[*] Keylogger 已注入（教學用途）");
    ''')

    # 注入頁面資訊收集
    info = await js.evaluate_value('''
        JSON.stringify({
            url: window.location.href,
            cookies: document.cookie,
            localStorage_keys: Object.keys(localStorage),
            user_agent: navigator.userAgent,
        })
    ''')
    print(f"  頁面資訊: {info}")


async def main():
    browser = Browser(port=9222)
    await browser.connect_existing()

    conn = await browser.get_page()
    page = Page(conn)
    network = NetworkMonitor(conn)
    js = JSExecutor(conn)

    await network.enable()
    await page.navigate("https://example.com")

    await demo_console_capture(page, js)
    await demo_cookie_inspection(page)
    await demo_js_injection(page, js)
    await demo_request_interception(page, network)

    print("\n=== 完成 ===")
    await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
