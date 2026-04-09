import asyncio
from playwright.async_api import async_playwright

SHOP_URL = "https://h29lzx.1shop-app.com/rtwcjr0917"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()

        img_urls = []
        async def on_response(resp):
            if "img.1shop" in resp.url and resp.status == 200:
                img_urls.append(resp.url)

        page = await context.new_page()
        page.on("response", on_response)

        print("載入頁面...")
        await page.goto(SHOP_URL, wait_until="networkidle")
        await asyncio.sleep(3)

        # 也用 JS 抓 img src
        imgs = await page.evaluate("""
            () => [...document.querySelectorAll('img')].map(i => ({
                src: i.src, dataSrc: i.getAttribute('data-src'), alt: i.alt
            }))
        """)
        print("=== JS img tags ===")
        for i in imgs[:30]:
            print(i)

        print("\n=== Network 圖片請求 ===")
        for u in img_urls[:20]:
            print(u)

        await browser.close()

asyncio.run(main())
