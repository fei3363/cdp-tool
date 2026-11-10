"""CDP 瀏覽器工具 CLI 介面"""

import argparse
import asyncio
import json
import sys
import os

# 修正 Windows console 中文編碼
if sys.platform == "win32":
    os.system("")  # 啟用 ANSI/VT100 支援
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8")

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from cdp import Browser, Page, JSExecutor, NetworkMonitor


async def cmd_screenshot(args):
    """截圖"""
    browser = Browser(port=args.port)
    await browser.connect_existing()
    conn = await browser.get_page()
    page = Page(conn)

    if args.url:
        print(f"導航到 {args.url} ...")
        await page.navigate(args.url)

    title = await page.get_title()
    url = await page.get_url()
    print(f"頁面: {title}")
    print(f"URL: {url}")

    output = args.output or "screenshot.png"
    await page.screenshot(path=output, full_page=args.full)
    print(f"截圖已儲存: {output}")
    await browser.close()


async def cmd_text(args):
    """擷取頁面文字"""
    browser = Browser(port=args.port)
    await browser.connect_existing()
    conn = await browser.get_page()
    page = Page(conn)
    js = JSExecutor(conn)

    if args.url:
        print(f"導航到 {args.url} ...")
        await page.navigate(args.url)

    title = await page.get_title()
    print(f"=== {title} ===\n")

    text = await js.evaluate_value("""
        (() => {
            const lines = [];
            document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li').forEach(el => {
                const tag = el.tagName.toLowerCase();
                const t = el.textContent.trim();
                if (!t || t.length < 2) return;
                if (tag.startsWith('h')) lines.push('\\n## ' + t);
                else if (tag === 'li') lines.push('  - ' + t);
                else lines.push(t);
            });
            return lines.join('\\n');
        })()
    """)
    print(text)

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"\n文字已儲存: {args.output}")

    await browser.close()


async def cmd_links(args):
    """擷取頁面所有連結"""
    browser = Browser(port=args.port)
    await browser.connect_existing()
    conn = await browser.get_page()
    page = Page(conn)
    js = JSExecutor(conn)

    if args.url:
        await page.navigate(args.url)

    title = await page.get_title()
    print(f"=== {title} 的連結 ===\n")

    links_json = await js.evaluate_value("""
        JSON.stringify(
            [...document.querySelectorAll('a[href]')]
                .map(a => ({text: a.textContent.trim(), href: a.href}))
                .filter(a => a.text && a.href.startsWith('http'))
        )
    """)
    links = json.loads(links_json or "[]")

    seen = set()
    for link in links:
        key = link["href"]
        if key in seen:
            continue
        seen.add(key)
        text = link["text"][:50]
        print(f"  {text} -> {link['href']}")

    print(f"\n共 {len(seen)} 個不重複連結")

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            json.dump(links, f, ensure_ascii=False, indent=2)
        print(f"連結已儲存: {args.output}")

    await browser.close()


async def cmd_cookies(args):
    """查看或匯出 Cookie"""
    browser = Browser(port=args.port)
    await browser.connect_existing()
    conn = await browser.get_page()
    page = Page(conn)

    url = await page.get_url()
    print(f"目前頁面: {url}\n")

    cookies = await page.get_cookies()
    for c in cookies:
        flags = []
        if c.get("httpOnly"):
            flags.append("HttpOnly")
        if c.get("secure"):
            flags.append("Secure")
        flag_str = f" [{', '.join(flags)}]" if flags else ""
        print(f"  {c['name']} = {c['value'][:60]}{flag_str}")

    print(f"\n共 {len(cookies)} 個 Cookie")

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            json.dump(cookies, f, ensure_ascii=False, indent=2)
        print(f"Cookie 已匯出: {args.output}")

    await browser.close()


async def cmd_monitor(args):
    """監聽網路請求"""
    browser = Browser(port=args.port)
    await browser.connect_existing()
    conn = await browser.get_page()
    page = Page(conn)
    network = NetworkMonitor(conn)

    await network.enable()

    if args.url:
        print(f"導航到 {args.url} ...")
        await page.navigate(args.url)
    else:
        print("監聽目前頁面的網路請求...")

    # 等待收集請求
    await asyncio.sleep(args.wait)

    print(f"\n=== 捕獲的請求 ===\n")
    for req_id, entry in network.requests.items():
        if args.filter and args.filter not in entry.url:
            continue
        status = entry.status or "---"
        print(f"  [{entry.method}] {status} {entry.url}")

    count = len(network.requests)
    print(f"\n共 {count} 筆請求")

    if args.output:
        data = [
            {
                "method": e.method,
                "url": e.url,
                "status": e.status,
                "headers": e.headers,
            }
            for e in network.requests.values()
        ]
        with open(args.output, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"請求記錄已儲存: {args.output}")

    await browser.close()


async def cmd_js(args):
    """執行 JavaScript"""
    browser = Browser(port=args.port)
    await browser.connect_existing()
    conn = await browser.get_page()
    js = JSExecutor(conn)

    if args.file:
        with open(args.file, "r", encoding="utf-8") as f:
            code = f.read()
    else:
        code = args.code

    result = await js.evaluate(code, await_promise=args.await_promise)
    value = result.get("value", result.get("description", str(result)))
    print(value)

    await browser.close()


async def cmd_navigate(args):
    """導航到指定 URL"""
    browser = Browser(port=args.port)
    await browser.connect_existing()
    conn = await browser.get_page()
    page = Page(conn)

    print(f"導航到 {args.url} ...")
    await page.navigate(args.url)
    title = await page.get_title()
    print(f"完成: {title}")

    await browser.close()


async def cmd_info(args):
    """顯示目前頁面資訊"""
    browser = Browser(port=args.port)
    await browser.connect_existing()

    targets = await browser.get_targets()
    pages = [t for t in targets if t.get("type") == "page"]

    print(f"Chrome debug port: {args.port}")
    print(f"分頁數量: {len(pages)}\n")

    for i, t in enumerate(pages):
        marker = " (active)" if i == 0 else ""
        print(f"  [{i}] {t.get('title', '(無標題)')}{marker}")
        print(f"      {t.get('url', '')}")

    await browser.close()


def main():
    parser = argparse.ArgumentParser(
        prog="cdp-tool",
        description="CDP 瀏覽器控制工具 — 透過 Chrome DevTools Protocol 操控瀏覽器",
    )
    parser.add_argument(
        "--port", type=int, default=9222, help="Chrome debug port（預設 9222）"
    )

    sub = parser.add_subparsers(dest="command", help="可用命令")

    # screenshot
    p = sub.add_parser("screenshot", aliases=["ss"], help="截圖")
    p.add_argument("url", nargs="?", help="要截圖的 URL（省略則截目前頁面）")
    p.add_argument("-o", "--output", help="輸出檔案路徑")
    p.add_argument("--full", action="store_true", help="整頁截圖")

    # text
    p = sub.add_parser("text", help="擷取頁面文字")
    p.add_argument("url", nargs="?", help="目標 URL")
    p.add_argument("-o", "--output", help="輸出到檔案")

    # links
    p = sub.add_parser("links", help="擷取頁面連結")
    p.add_argument("url", nargs="?", help="目標 URL")
    p.add_argument("-o", "--output", help="輸出到 JSON 檔案")

    # cookies
    p = sub.add_parser("cookies", help="查看 Cookie")
    p.add_argument("-o", "--output", help="匯出到 JSON 檔案")

    # monitor
    p = sub.add_parser("monitor", aliases=["mon"], help="監聽網路請求")
    p.add_argument("url", nargs="?", help="目標 URL")
    p.add_argument("--filter", help="篩選 URL 包含的關鍵字")
    p.add_argument("--wait", type=float, default=3, help="等待秒數（預設 3）")
    p.add_argument("-o", "--output", help="輸出到 JSON 檔案")

    # js
    p = sub.add_parser("js", help="執行 JavaScript")
    p.add_argument("code", nargs="?", help="JS 程式碼")
    p.add_argument("-f", "--file", help="JS 檔案路徑")
    p.add_argument("--await", dest="await_promise", action="store_true", help="等待 Promise")

    # navigate
    p = sub.add_parser("nav", help="導航到 URL")
    p.add_argument("url", help="目標 URL")

    # info
    p = sub.add_parser("info", help="顯示 Chrome 分頁資訊")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return

    # 對應命令到函式
    commands = {
        "screenshot": cmd_screenshot,
        "ss": cmd_screenshot,
        "text": cmd_text,
        "links": cmd_links,
        "cookies": cmd_cookies,
        "monitor": cmd_monitor,
        "mon": cmd_monitor,
        "js": cmd_js,
        "nav": cmd_navigate,
        "info": cmd_info,
    }

    func = commands.get(args.command)
    if func:
        try:
            asyncio.run(func(args))
        except ConnectionRefusedError:
            print("錯誤：無法連線到 Chrome debug port")
            print(f"請先用以下方式啟動 Chrome：")
            print(f'  chrome.exe --remote-debugging-port={args.port}')
            sys.exit(1)
        except Exception as e:
            print(f"錯誤：{e}")
            sys.exit(1)


if __name__ == "__main__":
    main()
