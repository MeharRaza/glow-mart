from fastapi import APIRouter, Depends, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.database import ProductDB, get_db
from datetime import datetime
import uuid

router = APIRouter()

try:
    from app.scraper.oriflame_scraper import (
        scrape_oriflame_category,
        scrape_all_categories,
        CATEGORY_URLS,
    )
    SCRAPER_AVAILABLE = True
except Exception as e:
    print(f'[scraper] Import failed: {type(e).__name__}: {e}')
    SCRAPER_AVAILABLE = False


class ScrapeRequest(BaseModel):
    url: Optional[str] = None
    category: Optional[str] = None   # 'Skincare' | 'Makeup' | 'Fragrance' | 'Haircare' | 'Body' | 'All'
    max_products: int = 100


class ImportRequest(BaseModel):
    products: List[Dict[str, Any]]


# ── Scrape ──────────────────────────────────────────────────────────────────

@router.post('/scrape')
async def scrape(request: ScrapeRequest):
    if not SCRAPER_AVAILABLE:
        return {
            'error': 'Playwright not installed.',
            'fix': 'pip install playwright && python -m playwright install chromium',
            'debug': 'Check backend terminal for the exact import error.'
        }

    try:
        # Scrape all categories
        if request.category == 'All' or (not request.url and not request.category):
            products = await scrape_all_categories(max_per_category=request.max_products)
            return products

        # Scrape specific category by name
        if request.category and request.category in CATEGORY_URLS:
            url = CATEGORY_URLS[request.category]
            products = await scrape_oriflame_category(url, request.max_products)
            return products

        # Scrape custom URL
        if request.url:
            products = await scrape_oriflame_category(request.url, request.max_products)
            return products

        return {'error': 'Provide either a URL or a category name.'}

    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        print(f'[scraper] Route error: {e}\n{tb}')
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/categories')
def get_categories():
    """Return available Oriflame PK category URLs."""
    if not SCRAPER_AVAILABLE:
        return {'error': 'Scraper not available'}
    return {'categories': list(CATEGORY_URLS.keys()), 'urls': CATEGORY_URLS}


@router.get('/status')
def status(db: Session = Depends(get_db)):
    count = db.query(ProductDB).count()
    return {
        'status': 'ready',
        'scraper_available': SCRAPER_AVAILABLE,
        'product_count': count,
    }


# ── Import ──────────────────────────────────────────────────────────────────

@router.post('/import')
def import_products(request: ImportRequest, db: Session = Depends(get_db)):
    imported = 0
    skipped  = 0

    for p in request.products:
        # Skip duplicates by oriflameUrl
        oriflame_url = p.get('oriflameUrl', '')
        if oriflame_url:
            exists = db.query(ProductDB).filter(
                ProductDB.oriflameUrl == oriflame_url
            ).first()
            if exists:
                skipped += 1
                continue

        row = ProductDB(
            id            = str(uuid.uuid4()),
            name          = p.get('name', ''),
            description   = p.get('description', ''),
            originalPrice = float(p.get('originalPrice', p.get('price', 0))),
            sellerPrice   = float(p.get('sellerPrice', p.get('price', 0))),
            images        = p.get('images', []),
            category      = p.get('category', 'Skincare'),
            tags          = p.get('tags', []),
            stock         = int(p.get('stock', 20)),
            isActive      = True,
            oriflameUrl   = oriflame_url or None,
            createdAt     = datetime.utcnow(),
            updatedAt     = datetime.utcnow(),
        )
        db.add(row)
        imported += 1

    db.commit()
    return {'imported': imported, 'skipped': skipped, 'total': imported + skipped}
