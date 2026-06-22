import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProductCardComponent } from '../../../components/product-card/product-card.component';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  styles: [`
    /* ── Category tab bar ── */
    .cat-nav { border-bottom: 1px solid #e8e0d6; background: #faf7f4; }
    .cat-nav-inner {
      max-width: 1280px; margin: 0 auto; padding: 0 2rem;
      display: flex; overflow-x: auto;
    }
    .cat-nav-inner::-webkit-scrollbar { display: none; }
    .cat-tab {
      font-family: 'Inter', sans-serif; font-size: 0.82rem; font-weight: 500;
      letter-spacing: 0.06em; color: #6b6560; white-space: nowrap;
      padding: 1rem 1.25rem; cursor: pointer;
      border-bottom: 2px solid transparent; margin-bottom: -1px;
      background: none; border-top: none; border-left: none; border-right: none;
      transition: color 0.2s;
    }
    .cat-tab:hover { color: #1a1410; }
    .cat-tab.active { color: #1a1410; border-bottom: 2px solid #1a1410; font-weight: 600; }

    /* ── Sub panel ── */
    .sub-panel { border-bottom: 1px solid #e8e0d6; background: #fff; }
    .sub-panel-inner { max-width: 1280px; margin: 0 auto; padding: 1.5rem 2rem 2rem; }
    .all-cat-link {
      display: inline-flex; align-items: center; gap: 0.3rem;
      font-family: 'Inter', sans-serif; font-size: 0.8rem; font-weight: 600;
      color: #1a1410; text-decoration: none; margin-bottom: 1.25rem; cursor: pointer;
    }
    .all-cat-link:hover { color: #c9a96e; }
    .sub-cols { display: grid; grid-template-columns: repeat(3, minmax(0, 200px)); gap: 0 3rem; }
    .sub-col-title {
      font-family: 'Inter', sans-serif; font-size: 0.65rem; font-weight: 600;
      letter-spacing: 0.18em; text-transform: uppercase; color: #1a1410; margin-bottom: 0.75rem;
    }
    .sub-col ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.4rem; }
    .sub-col ul li a { font-family: 'Inter', sans-serif; font-size: 0.82rem; color: #6b6560; text-decoration: none; transition: color 0.2s; cursor: pointer; }
    .sub-col ul li a:hover { color: #1a1410; }

    /* ── Page ── */
    .page { max-width: 1280px; margin: 0 auto; padding: 3rem 2rem; }

    @media (max-width: 600px) {
      .page { padding: 1.5rem 1rem; }
      .page-header { flex-direction: column; gap: 1rem; }
      .page-title { font-size: 1.75rem; }
      .header-right { width: 100%; flex-direction: column; gap: 0.75rem; }
      .search-input { width: 100%; }
      .sort-select { width: 100%; }
      .sub-cols { grid-template-columns: 1fr !important; }
      .cat-nav-inner { padding: 0 1rem; }
    }

    /* ── Header: title left, controls right ── */
    .page-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      gap: 2rem; flex-wrap: wrap;
      margin-bottom: 2.5rem; border-bottom: 1px solid #e8e0d6; padding-bottom: 2rem;
    }
    .page-title { font-family: 'DM Serif Display', Georgia, serif; font-size: 2.5rem; font-weight: 400; color: #1a1410; margin-bottom: 0.375rem; }
    .page-count { font-family: 'Inter', sans-serif; font-size: 0.8rem; letter-spacing: 0.08em; color: #9e9890; }

    .header-right { display: flex; align-items: flex-end; gap: 1.5rem; flex-wrap: wrap; }
    .ctrl-group { display: flex; flex-direction: column; gap: 0.4rem; }
    .ctrl-label {
      font-family: 'Inter', sans-serif; font-size: 0.65rem; font-weight: 600;
      letter-spacing: 0.2em; text-transform: uppercase; color: #1a1410;
    }
    .search-input {
      background: #fff; border: 1px solid #ddd8d0; padding: 0.55rem 0.875rem;
      font-family: 'Inter', sans-serif; font-size: 0.85rem; color: #1a1410;
      outline: none; transition: border-color 0.2s; width: 220px;
    }
    .search-input::placeholder { color: #b0a898; }
    .search-input:focus { border-color: #c9a96e; }

    .sort-select {
      background: #fff; border: 1px solid #ddd8d0; padding: 0.55rem 0.875rem;
      font-family: 'Inter', sans-serif; font-size: 0.82rem; color: #1a1410;
      outline: none; cursor: pointer;
    }
    .sort-select:focus { border-color: #c9a96e; }

    /* ── Grid ── */
    .products-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
    @media (max-width: 900px)  { .products-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 480px)  { .products-grid { grid-template-columns: 1fr; } }

    .empty {
      grid-column: 1/-1; text-align: center; padding: 5rem 2rem;
      font-family: 'DM Serif Display', serif; font-size: 1.5rem; color: #b0a898;
    }
  `],
  template: `
    <!-- ── Category tab bar ── -->
    <div class="cat-nav">
      <div class="cat-nav-inner">
        @for (cat of shopCategories; track cat.name) {
          <button class="cat-tab"
                  [class.active]="hoveredCat() === cat.name"
                  (mouseenter)="hoveredCat.set(cat.name)"
                  (mouseleave)="hoveredCat.set('')"
                  (click)="selectCategory(cat.name)">
            {{ cat.name }}
          </button>
        }
      </div>
    </div>

    <!-- ── Sub-panel ── -->
    @if (hoveredCat()) {
      @for (cat of shopCategories; track cat.name) {
        @if (hoveredCat() === cat.name) {
          <div class="sub-panel"
               (mouseenter)="hoveredCat.set(cat.name)"
               (mouseleave)="hoveredCat.set('')">
            <div class="sub-panel-inner">
              <a class="all-cat-link" (click)="selectCategory(cat.name); hoveredCat.set('')">
                All {{ cat.name }} ›
              </a>
              <div class="sub-cols">
                @for (col of cat.cols; track col.title) {
                  <div class="sub-col">
                    <div class="sub-col-title">{{ col.title }}</div>
                    <ul>
                      @for (item of col.items; track item) {
                        <li>
                          <a (click)="selectCategory(cat.name); searchQuery.set(item); hoveredCat.set('')">{{ item }}</a>
                        </li>
                      }
                    </ul>
                  </div>
                }
              </div>
            </div>
          </div>
        }
      }
    }

    <!-- ── Products page ── -->
    <div class="page">
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">{{ selectedCategory() || 'All Products' }}</h1>
          <p class="page-count">{{ filtered().length }} products found</p>
        </div>
        <div class="header-right">
          <div class="ctrl-group">
            <span class="ctrl-label">Search</span>
            <input type="text" class="search-input" placeholder="Search products..."
              [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" />
          </div>
          <div class="ctrl-group">
            <span class="ctrl-label">Sort By</span>
            <select class="sort-select" [ngModel]="sortBy()" (ngModelChange)="sortBy.set($event)">
              <option value="default">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div class="products-grid">
        @if (filtered().length === 0) {
          <div class="empty">No products found.</div>
        } @else {
          @for (product of filtered(); track product.id) {
            <app-product-card [product]="product" />
          }
        }
      </div>
    </div>
  `
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);

  allProducts = signal<Product[]>([]);
  categories = signal<string[]>([]);
  searchQuery = signal('');
  selectedCategory = signal('');
  sortBy = signal('default');
  hoveredCat = signal('');

  filtered = computed(() => {
    let items = this.allProducts();
    const q = this.searchQuery().toLowerCase();
    const cat = this.selectedCategory();
    const sort = this.sortBy();
    if (q) items = items.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    if (cat) items = items.filter(p => p.category === cat);
    if (sort === 'price-asc') items = [...items].sort((a, b) => a.sellerPrice - b.sellerPrice);
    if (sort === 'price-desc') items = [...items].sort((a, b) => b.sellerPrice - a.sellerPrice);
    return items;
  });

  selectCategory(cat: string) {
    this.selectedCategory.set(cat);
    this.searchQuery.set('');
  }

  ngOnInit() {
    this.productService.getProducts().subscribe(p => this.allProducts.set(p));
    this.productService.getCategories().subscribe(c => this.categories.set(c));
    this.route.queryParams.subscribe(params => {
      if (params['category']) this.selectedCategory.set(params['category']);
    });
  }

  shopCategories = [
    {
      name: 'Skincare',
      cols: [
        { title: 'Shop by product', items: ['Cleansers and toners', 'Serums', 'Moisturisers', 'Eye care', 'Lip care', 'SPF and sun care', 'Masks and exfoliators', 'Routines', 'Gifts'] },
        { title: 'Shop by benefit', items: ['Anti-ageing', 'Hydrating and plumping', 'Pore minimising', 'Even skin tone', 'Brightening', 'Soothing', 'Clarifying', 'Lifting and wrinkles correction', 'Eye brightening and dark circles'] },
        { title: 'Shop by ingredient', items: ['Salicylic acid', 'Hyaluronic acid', 'AHA', 'Niacinamide', 'Lactobionic acid', 'Peptides', 'Retinoids', 'Vitamin C', 'Ectoin'] },
      ]
    },
    {
      name: 'Fragrance',
      cols: [
        { title: 'Shop by type', items: ['Eau de Parfum', 'Eau de Toilette', 'Body Mist', 'Gift Sets'] },
        { title: 'Shop by mood', items: ['Fresh & Floral', 'Warm & Woody', 'Citrus & Light', 'Oriental & Spicy'] },
        { title: 'Shop by gender', items: ['For Her', 'For Him', 'Unisex'] },
      ]
    },
    {
      name: 'Makeup',
      cols: [
        { title: 'Face', items: ['Foundation', 'Concealer', 'Blush & Bronzer', 'Setting Powder', 'Primer'] },
        { title: 'Eyes', items: ['Mascara', 'Eyeliner', 'Eyeshadow', 'Brow'] },
        { title: 'Lips', items: ['Lipstick', 'Lip Gloss', 'Lip Liner', 'Lip Care'] },
      ]
    },
    {
      name: 'Nutrition',
      cols: [
        { title: 'Supplements', items: ['Vitamins', 'Collagen', 'Omega', 'Probiotics'] },
        { title: 'Wellness', items: ['Immunity', 'Energy', 'Sleep & Calm', 'Weight management'] },
        { title: 'Sport', items: ['Protein', 'Pre-workout', 'Recovery'] },
      ]
    },
    {
      name: 'Bath & Body',
      cols: [
        { title: 'Body care', items: ['Body lotions', 'Body oils', 'Body scrubs', 'Hand cream'] },
        { title: 'Bath', items: ['Shower gel', 'Bath salts', 'Soap bars'] },
        { title: 'Sun care', items: ['SPF body', 'After sun', 'Self-tan'] },
      ]
    },
    {
      name: 'Hair',
      cols: [
        { title: 'Hair care', items: ['Shampoo', 'Conditioner', 'Hair masks', 'Scalp care'] },
        { title: 'Styling', items: ['Heat protection', 'Serums & oils', 'Styling creams'] },
        { title: 'Colour', items: ['Hair colour', 'Colour care'] },
      ]
    },
    {
      name: 'Accessories',
      cols: [
        { title: 'Tools', items: ['Brushes & sponges', 'Face rollers', 'Gua sha', 'Tweezers & tools'] },
        { title: 'Bags & cases', items: ['Makeup bags', 'Travel sets'] },
        { title: 'Other', items: ['Mirrors', 'Headbands'] },
      ]
    },
  ];
}
