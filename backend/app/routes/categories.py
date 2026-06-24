from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import CategoryDB, get_db

router = APIRouter()

@router.get('/')
def get_categories(db: Session = Depends(get_db)):
    rows = db.query(CategoryDB).order_by(CategoryDB.order).all()
    return [
        {
            'id': r.id, 'name': r.name, 'icon': r.icon,
            'image': r.image, 'subcategories': r.subcategories or [], 'order': r.order
        }
        for r in rows
    ]
