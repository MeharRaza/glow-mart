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
    .page { max-width: 1280px; margin: 0 auto; padding: 4rem 2rem; }

    .page-header { margin-bottom: 3rem; border-bottom: 1px solid #e8e0d6; padding-bottom: 2rem; }
    .page-title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 2.5rem; font-weight: 400; color: #1a1410; margin-bottom: 0.375rem;
    }
    .page-count {
      font-family: 'Jost', sans-serif; font-size: 0.8rem;
      letter-spacing: 0.08em; color: #9e9890;
    }

    .layout { display: flex; gap: 3rem; align-items: flex-start; }
    @media (max-width: 768px) { .layout { flex-direction: column; } }

    .sidebar {
      width: 220px;
      flex-shrink: 0;
      position: sticky;
      top: 100px;
    }
    @media (max-width: 768px) { .sidebar { width: 100%; position: static; } }

    .filter-section { margin-bottom: 2rem; }
    .filter-title {
      font-family: 'Jost', sans-serif;
      font-size: 0.65rem; font-weight: 600;
      letter-spacing: 0.2em; text-transform: uppercase;
      color: #1a1410; margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #e8e0d6;
    }

    .search-input {
      width: 100%;
      background: #fff;
      border: 1px solid #ddd8d0;
      padding: 0.625rem 0.875rem;
      font-family: 'Jost', sans-serif;
      font-size: 0.85rem;
      color: #1a1410;
      outline: none;
      transition: border-color 0.2s;
    }
    .search-input::placeholder { color: #b0a898; }
    .search-input:focus { border-color: #c9a96e; }

    .cat-btn {
      display: block; width: 100%;
      text-align: left;
      padding: 0.5rem 0;
      font-family: 'Jost', sans-serif;
      font-size: 0.82rem;
      color: #9e9890;
      background: none; border: none; cursor: pointer;
      transition: color 0.2s;
      border-bottom: 1px solid transparent;
    }
    .cat-btn:hover { color: #1a1410; }
    .cat-btn.active { color: #1a1410; font-weight: 500; border-bottom-color: #c9a96e; }

    .sort-select {
      width: 100%;
      background: #fff;
      border: 1px solid #ddd8d0;
      padding: 0.625rem 0.875rem;
      font-family: 'Jost', sans-serif;
      font-size: 0.82rem;
      color: #1a1410;
      outline: none;
      cursor: pointer;
    }
    .sort-select:focus { border-color: #c9a96e; }

    .products-grid {
      flex: 1;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }
    @media (max-width: 1100px) { .products-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 480px)  { .products-grid { grid-template-columns: 1fr; } }

    .empty {
      grid-column: 1/-1;
      text-align: center;
      padding: 5rem 2rem;
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.5rem;
      color: #b0a898;
    }
  `],
  template: `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">All Products</h1>
        <p class="page-count">{{ filtered().length }} products found</p>
      </div>

      <div class="layout">
        <!-- Sidebar -->
        <aside class="sidebar">
          <div class="filter-section">
            <div class="filter-title">Search</div>
            <input type="text" class="search-input" placeholder="Search products..."
              [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" />
          </div>

          <div class="filter-section">
            <div class="filter-title">Category</div>
            <button class="cat-btn" [class.active]="selectedCategory() === ''"
              (click)="selectedCategory.set('')">All</button>
            @for (cat of categories(); track cat) {
              <button class="cat-btn" [class.active]="selectedCategory() === cat"
                (click)="selectedCategory.set(cat)">{{ cat }}</button>
            }
          </div>

          <div class="filter-section">
            <div class="filter-title">Sort By</div>
            <select class="sort-select" [ngModel]="sortBy()" (ngModelChange)="sortBy.set($event)">
              <option value="default">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </aside>

        <!-- Grid -->
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

  ngOnInit() {
    this.productService.getProducts().subscribe(p => this.allProducts.set(p));
    this.productService.getCategories().subscribe(c => this.categories.set(c));
    this.route.queryParams.subscribe(params => {
      if (params['category']) this.selectedCategory.set(params['category']);
    });
  }
}
