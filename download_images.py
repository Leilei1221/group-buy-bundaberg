import asyncio, pathlib
from playwright.async_api import async_playwright

SHOP_URL = "https://h29lzx.1shop-app.com/rtwcjr0917"
OUT = pathlib.Path("/Users/leilei/group-buy-bundaberg/images")

# SKU 圖片對應（從頁面分析取得的 CDN hash）
SKU_IMAGES = {
    "p01_combo":   "j7m6e8BLYJAAy9OENaG5RKMX",  # 綜合組A
    "p02_grape":   "Gr1Lb8a63ZLLEZpQNEAXx24D",  # 粉紅葡萄柚
    "p03_passion": "BW4907rb3bPPowM9NQGK6kwy",  # 百香果
    "p04_lemon":   "eKP9MRgBYr88Bn6RlOvLWZrn",  # 青青檸檬
    "p05_guava":   "dqpOVABK3244P8rONrkRwEv7",  # 紅心芭樂
    "p06_peach":   "a1A4ovQm3KXXv181lDxz6OWE",  # 蜜桃
    "p07_ginger":  "DPq15dgL3PqqR0ZylrBbJ2am",  # 經典薑汁
    "p08_mango":   "Wqybvx25N9yyWowgNREOMVPo",  # 熱帶芒果
    "p09_sarsap":  "dqpOVABK3244P8WONrkRwEv7",  # 沙士
    "p10_blood":   "j7m6e8BLYJAAy95gNaG5RKMX",  # 清新血橙
    "main":        "g1JZGpdVYBmmWydVN0onavMR",  # 主圖
}

CDN_BASE = "https://img.1shop.tw/Q8Zzy1eojALkqZO0qDpx739K/"
SUFFIXES = ["/1200x-2.jpg.avif", "/original-2.jpg.avif", "/800x-2.jpg.avif", "/original-2.jpg"]

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        print("載入頁面...")
        await page.goto(SHOP_URL, wait_until="networkidle")
        # 滾動頁面觸發懶載入
        for _ in range(5):
            await page.mouse.wheel(0, 1000)
            await asyncio.sleep(0.5)
        await asyncio.sleep(2)

        for name, hash_ in SKU_IMAGES.items():
            saved = False
            for suffix in SUFFIXES:
                url = CDN_BASE + hash_ + suffix
                try:
                    resp = await context.request.get(url, headers={"Referer": SHOP_URL})
                    if resp.status == 200:
                        body = await resp.body()
                        ext = ".avif" if "avif" in suffix else ".jpg"
                        out_path = OUT / f"{name}{ext}"
                        out_path.write_bytes(body)
                        print(f"✅ {name}{ext}  {len(body)} bytes  [{suffix}]")
                        saved = True
                        break
                except Exception as e:
                    pass
            if not saved:
                print(f"❌ {name} 失敗")

        await browser.close()

asyncio.run(main())
