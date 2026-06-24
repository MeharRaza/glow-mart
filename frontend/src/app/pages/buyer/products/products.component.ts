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
    .cat-nav { border-bottom: 1px solid #e8e0d6; background: #faf7f4; position: sticky; top: 106px; z-index: 50; }
    .cat-nav-inner {
      max-width: 1280px; margin: 0 auto; padding: 0 2rem;
      display: flex; overflow-x: auto; gap: 0;
    }
    .cat-nav-inner::-webkit-scrollbar { display: none; }

    .cat-tab {
      font-family: 'Inter', sans-serif; font-size: 0.8rem; font-weight: 500;
      letter-spacing: 0.05em; color: #6b6560; white-space: nowrap;
      padding: 1rem 1.25rem; cursor: pointer;
      border-bottom: 2px solid transparent; margin-bottom: -1px;
      background: none; border-top: none; border-left: none; border-right: none;
      transition: color 0.2s, border-color 0.2s;
    }
    .cat-tab:hover { color: #1a1410; }
    .cat-tab.active { color: #1a1410; border-bottom: 2px solid #c9a96e; font-weight: 600; }
    .cat-tab.all-tab.active { border-bottom-color: #1a1410; }

    /* ── Page ── */
    .page { max-width: 1280px; margin: 0 auto; padding: 3rem 2rem; }
    @media (max-width: 600px) {
      .page { padding: 1.5rem 1rem; }
      .page-header { flex-direction: column; gap: 1rem; }
      .page-title { font-size: 1.75rem; }
      .header-right { width: 100%; flex-direction: column; gap: 0.75rem; }
      .search-input { width: 100%; }
      .sort-select { width: 100%; }
      .cat-nav-inner { padding: 0 1rem; }
    }

    /* ── Header ── */
    .page-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      gap: 2rem; flex-wrap: wrap;
      margin-bottom: 2.5rem; border-bottom: 1px solid #e8e0d6; padding-bottom: 2rem;
    }
    .page-title { font-family: 'DM Serif Display', Georgia, serif; font-size: 2.5rem; font-weight: 400; color: #1a1410; margin-bottom: 0.375rem; }
    .page-count { font-family: 'Inter', sans-serif; font-size: 0.8rem; letter-spacing: 0.08em; color: #9e9890; }

    .header-right { display: flex; align-items: flex-end; gap: 1.5rem; flex-wrap: wrap; }
    .ctrl-group { display: flex; flex-direction: column; gap: 0.4rem; }
    .ctrl-label { font-family: 'Inter', sans-serif; font-size: 0.65rem; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: #1a1410; }
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
    @media (max-width: 900px) { .products-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 480px) { .products-grid { grid-template-columns: 1fr; } }

    .empty {
      grid-column: 1/-1; text-align: center; padding: 5rem 2rem;
      font-family: 'DM Serif Display', serif; font-size: 1.5rem; color: #b0a898;
    }
  `],
  template: `
    <!-- ── Category tab bar (real DB categories) ── -->
    <div class="cat-nav">
      <div class="cat-nav-inner">
        <button class="cat-tab all-tab"
                [class.active]="selectedCategory() === ''"
                (click)="selectCategory('')">
          All
        </button>
        @for (cat of categories(); track cat) {
          <button class="cat-tab"
                  [class.active]="selectedCategory() === cat"
                  (click)="selectCategory(cat)">
            {{ cat }}
          </button>
        }
      </div>
    </div>

    <!-- ── Products page ── -->
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ selectedCategory() || 'All Products' }}</h1>
          <p class="page-count">{{ filtered().length }} product{{ filtered().length !== 1 ? 's' : '' }} found</p>
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

  allProducts    = signal<Product[]>([]);
  categories     = signal<string[]>([]);
  searchQuery    = signal('');
  selectedCategory = signal('');
  sortBy         = signal('default');

  filtered = computed(() => {
    let items = this.allProducts();
    const q    = this.searchQuery().toLowerCase();
    const cat  = this.selectedCategory();
    const sort = this.sortBy();
    if (q)   items = items.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    if (cat) items = items.filter(p => p.category === cat);
    if (sort === 'price-asc')  items = [...items].sort((a, b) => a.sellerPrice - b.sellerPrice);
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
}
