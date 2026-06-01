"""
Oriflame Pakistan Scraper
Strategy 1: httpx + BeautifulSoup (fast, no browser needed)
Strategy 2: Playwright fallback (if JS rendering needed)
"""
import asyncio
import re
import json
import httpx
from bs4 import BeautifulSoup
from typing import List, Dict, Optional

# ── Category URLs ────────────────────────────────────────────────────────────
CATEGORY_URLS = {
    'Skincare':  'https://www.oriflame.com.pk/skincare',
    'Makeup':    'https://www.oriflame.com.pk/makeup',
    'Fragrance': 'https://www.oriflame.com.pk/fragrance',
    'Haircare':  'https://www.oriflame.com.pk/hair-care',
    'Body':      'https://www.oriflame.com.pk/body',
}

HEADERS = {
    'User-Agent': (
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
        'AppleWebKit/537.36 (KHTML, like Gecko) '
        'Chrome/124.0.0.0 Safari/537.36'
    ),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Referer': 'https://www.oriflame.com.pk/',
}


def _parse_price(text: str) -> float:
    digits = re.sub(r'[^\d.]', '', text.replace(',', ''))
    try:
        return float(digits)
    except ValueError:
        return 0.0


def _detect_category(url: str, name: str) -> str:
    u, n = url.lower(), name.lower()
    if 'makeup' in u or any(k in n for k in ['lipstick','mascara','foundation','blush','eyeshadow','liner','bronz','highlighter','brow']):
        return 'Makeup'
    if 'fragrance' in u or any(k in n for k in ['parfum','eau de','perfume','mist','deodorant']):
        return 'Fragrance'
    if 'hair' in u or any(k in n for k in ['shampoo','conditioner','hair','scalp']):
        return 'Haircare'
    if 'body' in u or any(k in n for k in ['body','hand cream','lotion','shower','soap']):
        return 'Body'
    return 'Skincare'


def _extract_json_ld(soup: BeautifulSoup) -> List[Dict]:
    """Try to extract product data from JSON-LD scripts embedded in page."""
    products = []
    for script in soup.find_all('script', type='application/ld+json'):
        try:
            data = json.loads(script.string or '{}')
            # Handle both single object and array
            items = data if isinstance(data, list) else [data]
            for item in items:
                if item.get('@type') in ('Product', 'ItemList'):
                    if item.get('@type') == 'ItemList':
                        for el in item.get('itemListElement', []):
                            p = el.get('item', el)
                            products.append(p)
                    else:
                        products.append(item)
        except Exception:
            continue
    return products


def _parse_json_ld_product(item: Dict, base_url: str) -> Optional[Dict]:
    """Convert a JSON-LD Product object to our format."""
    name = item.get('name', '').strip()
    if not name:
        return None

    # Price
    offers = item.get('offers', {})
    if isinstance(offers, list):
        offers = offers[0] if offers else {}
    price = _parse_price(str(offers.get('price', 0)))
    orig_price = price

    # Image
    image = item.get('image', '')
    if isinstance(image, list):
        image = image[0] if image else ''
    if isinstance(image, dict):
        image = image.get('url', '')

    # URL
    url = item.get('url', base_url)

    if price == 0:
        return None

    return {
        'name':          name,
        'description':   item.get('description', f'Premium {name} by Oriflame Pakistan.'),
        'originalPrice': orig_price,
        'sellerPrice':   round(price * 0.85),
        'images':        [image] if image else [],
        'category':      _detect_category(base_url, name),
        'tags':          ['oriflame', 'pakistan'],
        'stock':         20,
        'oriflameUrl':   url,
    }


def _parse_html_products(soup: BeautifulSoup, base_url: str) -> List[Dict]:
    """Parse product cards from HTML using multiple selector strategies."""
    products = []

    # Strategy A: find all product links with price nearby
    # Oriflame PK renders product names and prices as text nodes
    # Pattern: (review_count) BrandName ProductName PKRprice.0
    raw_text = soup.get_text(separator='\n')
    lines = [l.strip() for l in raw_text.split('\n') if l.strip()]

    i = 0
    while i < len(lines):
        line = lines[i]

        # Look for review count pattern like "(514)" or "(1020)"
        if re.match(r'^\(\d+\)$', line):
            try:
                # Next line(s): brand name, product name, price
                brand = lines[i + 1] if i + 1 < len(lines) else ''
                name_line = lines[i + 2] if i + 2 < len(lines) else ''
                price_line = lines[i + 3] if i + 3 < len(lines) else ''

                # Price line should contain PKR
                if 'PKR' not in price_line and i + 4 < len(lines):
                    name_line = lines[i + 2] + ' ' + lines[i + 3]
                    price_line = lines[i + 4]

                if 'PKR' not in price_line:
                    i += 1
                    continue

                # Extract prices — may have sale + original
                prices = re.findall(r'PKR([\d,]+\.?\d*)', price_line)
                if not prices:
                    i += 1
                    continue

                sale_price = _parse_price(prices[0])
                orig_price = _parse_price(prices[1]) if len(prices) > 1 else sale_price

                full_name = f"{brand} {name_line}".strip() if brand and brand.lower() not in name_line.lower() else name_line
                full_name = re.sub(r'\s+', ' ', full_name).strip()

                if full_name and sale_price > 0:
                    products.append({
                        'name':          full_name,
                        'description':   f'Premium {full_name} by Oriflame Pakistan.',
                        'originalPrice': orig_price,
                        'sellerPrice':   round(sale_price * 0.85),
                        'images':        [],
                        'category':      _detect_category(base_url, full_name),
                        'tags':          ['oriflame', 'pakistan'],
                        'stock':         20,
                        'oriflameUrl':   base_url,
                    })
            except (IndexError, ValueError):
                pass

        i += 1

    # Strategy B: BeautifulSoup tag-based selectors
    if not products:
        selectors = [
            '[class*="ProductCard"]', '[class*="product-card"]',
            '[class*="ProductItem"]', '[class*="product-item"]',
            'article', 'li[class*="product"]',
        ]
        cards = []
        for sel in selectors:
            cards = soup.select(sel)
            if cards:
                break

        for card in cards:
            try:
                name_el = card.select_one('h2,h3,h4,[class*="name"],[class*="Name"],[class*="title"]')
                price_el = card.select_one('[class*="price"],[class*="Price"]')
                img_el   = card.select_one('img')
                link_el  = card.select_one('a[href]')

                name = name_el.get_text(strip=True) if name_el else ''
                if not name:
                    continue

                price_text = price_el.get_text(strip=True) if price_el else '0'
                price = _parse_price(price_text)
                if price == 0:
                    continue

                image = ''
                if img_el:
                    image = img_el.get('src') or img_el.get('data-src') or ''
                    if image.startswith('//'):
                        image = 'https:' + image
                    elif image.startswith('/'):
                        image = 'https://www.oriflame.com.pk' + image

                href = link_el.get('href', '') if link_el else ''
                if href.startswith('/'):
                    href = 'https://www.oriflame.com.pk' + href

                products.append({
                    'name':          name,
                    'description':   f'Premium {name} by Oriflame Pakistan.',
                    'originalPrice': price,
                    'sellerPrice':   round(price * 0.85),
                    'images':        [image] if image else [],
                    'category':      _detect_category(base_url, name),
                    'tags':          ['oriflame', 'pakistan'],
                    'stock':         20,
                    'oriflameUrl':   href or base_url,
                })
            except Exception:
                continue

    return products


async def scrape_oriflame_category(url: str, max_products: int = 100) -> List[Dict]:
    """
    Scrape products from an Oriflame PK category page.
    Tries httpx first (fast), falls back to Playwright if needed.
    """
    products = await _scrape_with_httpx(url, max_products)

    if not products:
        print(f'[scraper] httpx got no products, trying Playwright for {url}')
        products = await _scrape_with_playwright(url, max_products)

    return products[:max_products]


async def _scrape_with_httpx(url: str, max_products: int) -> List[Dict]:
    """Fast scrape using httpx — no browser needed."""
    products = []
    try:
        async with httpx.AsyncClient(
            headers=HEADERS,
            follow_redirects=True,
            timeout=30,
            verify=False,
        ) as client:
            resp = await client.get(url)
            if resp.status_code != 200:
                print(f'[scraper] httpx got status {resp.status_code} for {url}')
                return []

            soup = BeautifulSoup(resp.text, 'html.parser')

            # Try JSON-LD first (most reliable)
            json_items = _extract_json_ld(soup)
            for item in json_items:
                p = _parse_json_ld_product(item, url)
                if p:
                    products.append(p)

            # Fallback to HTML parsing
            if not products:
                products = _parse_html_products(soup, url)

            print(f'[scraper] httpx found {len(products)} products from {url}')

    except Exception as e:
        print(f'[scraper] httpx error: {e}')

    return products


async def _scrape_with_playwright(url: str, max_products: int) -> List[Dict]:
    """Playwright fallback — handles JS-rendered pages."""
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        print('[scraper] Playwright not installed.')
        return []

    products = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        )
        context = await browser.new_context(
            user_agent=HEADERS['User-Agent'],
            locale='en-US',
            viewport={'width': 1280, 'height': 900},
        )
        page = await context.new_page()

        # Block only fonts — keep images
        await page.route('**/*.{woff,woff2,ttf,otf}', lambda r: r.abort())

        try:
            await page.goto(url, wait_until='domcontentloaded', timeout=40000)
            await asyncio.sleep(3)

            # Scroll down to trigger lazy image loading
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight / 2)')
            await asyncio.sleep(1)
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
            await asyncio.sleep(2)
            await page.evaluate('window.scrollTo(0, 0)')
            await asyncio.sleep(1)

            # Click "Show more" up to 10 times to load all products
            for _ in range(10):
                try:
                    btn = page.locator('button:has-text("Show"), button:has-text("Load"), button:has-text("more")')
                    if await btn.count() > 0 and await btn.first.is_visible():
                        await btn.first.click()
                        await asyncio.sleep(2)
                    else:
                        break
                except Exception:
                    break

            # Extract products using JS evaluation
            raw = await page.evaluate('''() => {
                const results = [];

                // Collect ALL oriflame CDN images on page
                const allImgs = Array.from(document.querySelectorAll('img'))
                    .map(img => img.src || '')
                    .filter(src => src.includes('media-cdn.oriflame.com'));

                // Card selectors
                const selectors = ['[class*="ProductCard"]','[class*="product-card"]','[class*="ProductItem"]','li[class*="product"]','article'];
                let cards = [];
                for (const sel of selectors) {
                    cards = Array.from(document.querySelectorAll(sel));
                    if (cards.length > 2) break;
                }

                // If no cards found, try to parse from page text structure
                if (cards.length === 0) {
                    // Fallback: get all product links
                    const links = Array.from(document.querySelectorAll('a[href*="/products/"]'));
                    links.forEach((link, idx) => {
                        const text = link.textContent.trim();
                        if (text.length > 3) {
                            results.push({
                                name: text, brand: '', salePrice: 0, origPrice: 0,
                                image: allImgs[idx] || '', href: link.href, soldOut: false
                            });
                        }
                    });
                    return results;
                }

                cards.forEach((card, idx) => {
                    try {
                        const nameEl = card.querySelector('[class*="name"],[class*="Name"],[class*="title"],h2,h3,h4');
                        const name = nameEl ? nameEl.textContent.trim() : '';
                        if (!name || name.length < 2) return;

                        const brandEl = card.querySelector('[class*="brand"],[class*="Brand"],[class*="series"]');
                        const brand = brandEl ? brandEl.textContent.trim() : '';

                        const priceEls = Array.from(card.querySelectorAll('[class*="rice"]'));
                        const prices = priceEls
                            .map(el => parseFloat(el.textContent.replace(/[^0-9.]/g,'')))
                            .filter(n => n > 100);
                        if (!prices.length) return;

                        const salePrice = Math.min(...prices);
                        const origPrice = Math.max(...prices);

                        // Use page-level image by index (most reliable for Oriflame)
                        const image = allImgs[idx] || '';

                        const linkEl = card.querySelector('a[href*="/products/"]') || card.querySelector('a[href]');
                        const href = linkEl ? linkEl.href : '';
                        const soldOut = card.textContent.toLowerCase().includes('sold out');

                        results.push({ name, brand, salePrice, origPrice, image, href, soldOut });
                    } catch(e) {}
                });
                return results;
            }''')

            for item in raw:
                name = item.get('name', '').strip()
                brand = item.get('brand', '').strip()
                full_name = f"{brand} {name}".strip() if brand and brand.lower() not in name.lower() else name
                full_name = re.sub(r'\s+', ' ', full_name).strip()

                sale_price = float(item.get('salePrice', 0))
                orig_price = float(item.get('origPrice', sale_price))
                image = item.get('image', '')
                href = item.get('href', url)
                sold_out = item.get('soldOut', False)

                if not full_name or sale_price == 0:
                    continue

                # Fix image URL
                if image.startswith('//'):
                    image = 'https:' + image
                elif image.startswith('/'):
                    image = 'https://www.oriflame.com.pk' + image

                products.append({
                    'name':          full_name,
                    'description':   f'Premium {full_name} by Oriflame Pakistan.',
                    'originalPrice': orig_price,
                    'sellerPrice':   round(sale_price * 0.85),
                    'images':        [image] if image else [],
                    'category':      _detect_category(url, full_name),
                    'tags':          ['oriflame', 'pakistan'],
                    'stock':         0 if sold_out else 20,
                    'oriflameUrl':   href or url,
                })

            # Fallback to HTML parsing if JS eval got nothing
            if not products:
                html = await page.content()
                soup = BeautifulSoup(html, 'html.parser')
                json_items = _extract_json_ld(soup)
                for item in json_items:
                    p = _parse_json_ld_product(item, url)
                    if p:
                        products.append(p)
                if not products:
                    products = _parse_html_products(soup, url)

            print(f'[scraper] Playwright found {len(products)} products from {url}')

        except Exception as e:
            print(f'[scraper] Playwright error: {e}')
        finally:
            await browser.close()

    return products


async def scrape_all_categories(max_per_category: int = 50) -> List[Dict]:
    """Scrape all Oriflame PK categories."""
    all_products = []
    for category, url in CATEGORY_URLS.items():
        print(f'[scraper] Category: {category}')
        products = await scrape_oriflame_category(url, max_per_category)
        all_products.extend(products)
        await asyncio.sleep(1)
    return all_products
