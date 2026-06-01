import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';
import { ProductCardComponent } from '../../../components/product-card/product-card.component';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, NgFor, ProductCardComponent],
  styles: [`
    /* ── Hero ─────────────────────────────────────────────── */
    .hero {
      min-height: 92vh;
      display: grid;
      grid-template-columns: 1fr 1fr;
      background: #f5f0e8;
      overflow: hidden;
    }
    @media (max-width: 900px) {
      .hero { grid-template-columns: 1fr; min-height: auto; }
      .hero-visual { display: none; }
    }

    .hero-content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 6rem 4rem 6rem 8rem;
    }
    @media (max-width: 1200px) { .hero-content { padding: 4rem 3rem 4rem 4rem; } }
    @media (max-width: 900px)  { .hero-content { padding: 5rem 2rem 4rem; align-items: center; text-align: center; } }

    .hero-eyebrow {
      font-family: 'Jost', sans-serif;
      font-size: 0.7rem;
      font-weight: 500;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #c9a96e;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .hero-eyebrow::before, .hero-eyebrow::after {
      content: '';
      flex: 1;
      max-width: 40px;
      height: 1px;
      background: #c9a96e;
    }
    @media (max-width: 900px) {
      .hero-eyebrow::before, .hero-eyebrow::after { display: none; }
    }

    .hero-title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: clamp(3.5rem, 5vw, 5.5rem);
      font-weight: 300;
      line-height: 1.05;
      color: #1a1410;
      margin-bottom: 1.5rem;
    }
    .hero-title em {
      font-style: italic;
      font-weight: 400;
      background: linear-gradient(135deg, #c9a96e, #8b6914);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-desc {
      font-family: 'Jost', sans-serif;
      font-size: 1rem;
      color: #6b6560;
      line-height: 1.8;
      max-width: 400px;
      margin-bottom: 2.5rem;
    }

    .hero-btns { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 3rem; }

    .hero-stats {
      display: flex;
      gap: 2.5rem;
      padding-top: 2rem;
      border-top: 1px solid #ddd8d0;
    }
    .stat-num {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.75rem;
      font-weight: 600;
      color: #1a1410;
      line-height: 1;
    }
    .stat-label {
      font-family: 'Jost', sans-serif;
      font-size: 0.7rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #9e9890;
      margin-top: 0.25rem;
    }

    .hero-visual {
      position: relative;
      background: linear-gradient(160deg, #ede5d8 0%, #e0d4c4 100%);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .hero-visual-inner {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Main tall product image */
    .hero-main-img {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-62%, -50%);
      width: 42%;
      aspect-ratio: 2/3;
      overflow: hidden;
      box-shadow: 0 24px 64px rgba(26,20,16,0.18);
    }
    .hero-main-img img {
      width: 100%; height: 100%; object-fit: cover;
    }

    /* Second overlapping image */
    .hero-second-img {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-5%, -58%);
      width: 36%;
      aspect-ratio: 2/3;
      overflow: hidden;
      box-shadow: 0 16px 48px rgba(26,20,16,0.14);
    }
    .hero-second-img img {
      width: 100%; height: 100%; object-fit: cover;
    }

    /* Third small image bottom right */
    .hero-third-img {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(28%, -20%);
      width: 28%;
      aspect-ratio: 1/1;
      overflow: hidden;
      box-shadow: 0 12px 32px rgba(26,20,16,0.12);
    }
    .hero-third-img img {
      width: 100%; height: 100%; object-fit: cover;
    }

    /* Floating info cards */
    .hero-float {
      position: absolute;
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.8);
      box-shadow: 0 8px 32px rgba(26,20,16,0.1);
      padding: 0.875rem 1.125rem;
    }
    .hero-float.top-left  { top: 12%; left: 6%; }
    .hero-float.bot-right { bottom: 10%; right: 5%; }

    .float-label {
      font-family: 'Jost', sans-serif;
      font-size: 0.6rem; font-weight: 500;
      letter-spacing: 0.18em; text-transform: uppercase;
      color: #9e9890; margin-bottom: 0.25rem;
    }
    .float-value {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1rem; font-weight: 600; color: #1a1410;
    }
    .float-sub {
      font-family: 'Jost', sans-serif;
      font-size: 0.72rem; color: #c9a96e; margin-top: 0.2rem;
    }

    /* Decorative gold line */
    .hero-deco-line {
      position: absolute;
      top: 0; bottom: 0; left: 0;
      width: 3px;
      background: linear-gradient(180deg, transparent, #c9a96e 30%, #c9a96e 70%, transparent);
      z-index: 2;
    }

    /* ── Marquee ──────────────────────────────────────────── */
    .marquee-bar {
      background: #1a1410;
      padding: 0.875rem 0;
      overflow: hidden;
    }

    /* ── Section header ───────────────────────────────────── */
    .section-header {
      text-align: center;
      margin-bottom: 3.5rem;
    }
    .section-eyebrow {
      font-family: 'Jost', sans-serif;
      font-size: 0.7rem;
      font-weight: 500;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #c9a96e;
      margin-bottom: 0.875rem;
    }
    .section-title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: clamp(2rem, 3.5vw, 3rem);
      font-weight: 400;
      color: #1a1410;
      line-height: 1.15;
    }
    .section-title em { font-style: italic; }

    /* ── Category cards ───────────────────────────────────── */
    .cat-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }
    @media (max-width: 900px) { .cat-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 480px) { .cat-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; } }

    .cat-card {
      position: relative;
      overflow: hidden;
      cursor: pointer;
      text-decoration: none;
      display: block;
    }

    .cat-img {
      aspect-ratio: 3/4;
      overflow: hidden;
      position: relative;
    }
    .cat-img img {
      width: 100%; height: 100%;
      object-fit: cover;
      transition: transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94);
      display: block;
    }
    .cat-card:hover .cat-img img { transform: scale(1.08); }

    .cat-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to bottom,
        rgba(26,20,16,0) 40%,
        rgba(26,20,16,0.55) 75%,
        rgba(26,20,16,0.82) 100%
      );
      transition: opacity 0.4s ease;
    }
    .cat-card:hover .cat-overlay {
      background: linear-gradient(
        to bottom,
        rgba(26,20,16,0) 30%,
        rgba(26,20,16,0.65) 70%,
        rgba(26,20,16,0.88) 100%
      );
    }

    .cat-info {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      padding: 1.5rem 1.25rem 1.25rem;
    }
    .cat-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.3rem;
      font-weight: 500;
      color: #fff;
      margin-bottom: 0.2rem;
      line-height: 1.2;
    }
    .cat-desc {
      font-family: 'Jost', sans-serif;
      font-size: 0.75rem;
      color: rgba(255,255,255,0.65);
      letter-spacing: 0.03em;
      margin-bottom: 0.625rem;
    }
    .cat-arrow {
      font-family: 'Jost', sans-serif;
      font-size: 0.68rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #c9a96e;
      opacity: 0;
      transform: translateY(6px);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .cat-card:hover .cat-arrow { opacity: 1; transform: translateY(0); }

    /* ── Products grid ────────────────────────────────────── */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
    }
    @media (max-width: 900px) { .products-grid { grid-template-columns: repeat(2, 1fr); gap: 1.5rem; } }
    @media (max-width: 480px) { .products-grid { grid-template-columns: 1fr; } }

    /* ── How it works ─────────────────────────────────────── */
    .steps-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0;
    }
    @media (max-width: 768px) { .steps-grid { grid-template-columns: 1fr; } }

    .step-item {
      padding: 3rem 2.5rem;
      border-right: 1px solid #e8e0d6;
      text-align: center;
    }
    .step-item:last-child { border-right: none; }
    @media (max-width: 768px) {
      .step-item { border-right: none; border-bottom: 1px solid #e8e0d6; }
      .step-item:last-child { border-bottom: none; }
    }

    .step-num {
      font-family: 'Cormorant Garamond', serif;
      font-size: 3.5rem;
      font-weight: 300;
      color: #e8e0d6;
      line-height: 1;
      margin-bottom: 1rem;
    }
    .step-icon { display:flex; justify-content:center; margin-bottom: 1rem; }
    .step-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.3rem;
      font-weight: 500;
      color: #1a1410;
      margin-bottom: 0.75rem;
    }
    .step-desc {
      font-family: 'Jost', sans-serif;
      font-size: 0.85rem;
      color: #9e9890;
      line-height: 1.7;
    }

    /* ── CTA banner ───────────────────────────────────────── */
    .cta-banner {
      background: #1a1410;
      padding: 6rem 2rem;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .cta-banner::before {
      content: '';
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 600px; height: 600px;
      background: radial-gradient(circle, rgba(201,169,110,0.08) 0%, transparent 70%);
      pointer-events: none;
    }
    .cta-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(2.5rem, 5vw, 4rem);
      font-weight: 300;
      color: #faf7f4;
      line-height: 1.15;
      margin-bottom: 1.25rem;
    }
    .cta-title em {
      font-style: italic;
      background: linear-gradient(135deg, #c9a96e, #8b6914);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .cta-sub {
      font-family: 'Jost', sans-serif;
      font-size: 0.9rem;
      color: #9e9890;
      margin-bottom: 2.5rem;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }
  `],
  template: `

    <!-- ══════════════════════════════════════════════ HERO ══ -->
    <section class="hero">
      <!-- Left: Content -->
      <div class="hero-content">
        <div class="hero-eyebrow">Luxury Beauty</div>

        <h1 class="hero-title">
          Discover Your<br>
          <em>Perfect Glow</em><br>
          This Season
        </h1>

        <p class="hero-desc">
          Premium skincare, makeup &amp; fragrance curated for you. No account needed — just browse, order, and glow.
        </p>

        <div class="hero-btns">
          <a routerLink="/products" class="btn-primary">Shop the Collection</a>
          <a href="#categories" class="btn-outline">Explore Categories</a>
        </div>

        <div class="hero-stats">
          @for (s of stats; track s.label) {
            <div>
              <div class="stat-num">{{ s.num }}</div>
              <div class="stat-label">{{ s.label }}</div>
            </div>
          }
        </div>
      </div>

      <!-- Right: Visual -->
      <div class="hero-visual">
        <div class="hero-deco-line"></div>
        <div class="hero-visual-inner">

          <!-- Main tall image -->
          <div class="hero-main-img">
            <img src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80" alt="Skincare" />
          </div>

          <!-- Second overlapping image -->
          <div class="hero-second-img">
            <img src="https://images.unsplash.com/photo-1586495777744-4e6232bf9f06?w=600&q=80" alt="Makeup" />
          </div>

          <!-- Third small image -->
          <div class="hero-third-img">
            <img src="https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&q=80" alt="Fragrance" />
          </div>

          <!-- Floating card: top left -->
          <div class="hero-float top-left">
            <div class="float-label">New Arrival</div>
            <div class="float-value">Glow Serum Pro</div>
            <div class="float-sub">PKR 2,800</div>
          </div>

          <!-- Floating card: bottom right -->
          <div class="hero-float bot-right">
            <div style="display:flex;align-items:center;gap:0.625rem;">
              <div style="display:flex;gap:2px;">
                @for (s of [1,2,3,4,5]; track s) {
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="#c9a96e">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                }
              </div>
              <div>
                <div class="float-value" style="font-size:0.9rem;">4.9 / 5.0</div>
                <div class="float-label" style="margin:0;">1,200+ Reviews</div>
              </div>
            </div>
          </div>

        </div>

        <!-- Vertical text -->
        <div style="position:absolute;bottom:2rem;right:1.5rem;font-family:'Jost',sans-serif;font-size:0.6rem;letter-spacing:0.25em;text-transform:uppercase;color:#b0a898;writing-mode:vertical-rl;">
          Premium · Authentic · Pakistan
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════ MARQUEE ══ -->
    <div class="marquee-bar">
      <div class="marquee-track" style="display:flex;gap:3rem;align-items:center;">
        @for (item of marqueeItems.concat(marqueeItems); track $index) {
          <span style="font-family:'Jost',sans-serif;font-size:0.7rem;letter-spacing:0.2em;text-transform:uppercase;color:#c9a96e;white-space:nowrap;flex-shrink:0;display:flex;align-items:center;gap:0.75rem;">
            <!-- diamond separator -->
            <svg width="8" height="8" viewBox="0 0 8 8" fill="#c9a96e"><rect x="4" y="0" width="5.66" height="5.66" transform="rotate(45 4 0)"/></svg>
            {{ item }}
          </span>
        }
      </div>
    </div>

    <!-- ══════════════════════════════════════════ CATEGORIES ══ -->
    <section id="categories" style="padding:6rem 2rem;max-width:1280px;margin:0 auto;">
      <div class="section-header">
        <div class="section-eyebrow">Explore</div>
        <h2 class="section-title">Shop by <em>Category</em></h2>
      </div>

      <div class="cat-grid">
        @for (cat of categories; track cat.name) {
          <a routerLink="/products" [queryParams]="{category: cat.name}" class="cat-card">
            <!-- Full bleed image -->
            <div class="cat-img">
              <img [src]="cat.img" [alt]="cat.name" loading="lazy" />
              <div class="cat-overlay"></div>
            </div>
            <!-- Text over image -->
            <div class="cat-info">
              <div class="cat-name">{{ cat.name }}</div>
              <div class="cat-desc">{{ cat.desc }}</div>
              <div class="cat-arrow">
                Shop Now
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-left:4px;"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </div>
          </a>
        }
      </div>
    </section>

    <!-- Gold divider -->
    <div style="max-width:1280px;margin:0 auto;padding:0 2rem;"><div class="gold-divider"></div></div>

    <!-- ══════════════════════════════════════════ PRODUCTS ══ -->
    <section style="padding:6rem 2rem;max-width:1280px;margin:0 auto;">
      <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:3.5rem;flex-wrap:wrap;gap:1rem;">
        <div>
          <div class="section-eyebrow" style="text-align:left;">Curated Selection</div>
          <h2 class="section-title" style="text-align:left;">Featured <em>Products</em></h2>
        </div>
        <a routerLink="/products"
           style="font-family:'Jost',sans-serif;font-size:0.75rem;letter-spacing:0.15em;text-transform:uppercase;color:#1a1410;text-decoration:none;border-bottom:1px solid #1a1410;padding-bottom:2px;display:inline-flex;align-items:center;gap:0.5rem;"
           onmouseover="this.style.color='#c9a96e';this.style.borderColor='#c9a96e'"
           onmouseout="this.style.color='#1a1410';this.style.borderColor='#1a1410'">
          View All Products
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>

      <div class="products-grid">
        @for (product of products(); track product.id) {
          <app-product-card [product]="product" />
        }
      </div>
    </section>

    <!-- ══════════════════════════════════════════ HOW IT WORKS ══ -->
    <section style="background:#f5f0e8;border-top:1px solid #e8e0d6;border-bottom:1px solid #e8e0d6;">
      <div style="max-width:1280px;margin:0 auto;padding:5rem 2rem 4rem;">
        <div class="section-header">
          <div class="section-eyebrow">The Process</div>
          <h2 class="section-title">How It <em>Works</em></h2>
        </div>
      </div>
      <div style="max-width:1280px;margin:0 auto;padding:0 2rem 5rem;">
        <div class="steps-grid">
          @for (step of steps; track step.no) {
            <div class="step-item">
              <div class="step-num">0{{ step.no }}</div>
              <div class="step-icon">
                <svg [attr.viewBox]="step.svg.viewBox" width="36" height="36" fill="none" stroke="#c9a96e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path *ngFor="let d of step.svg.paths" [attr.d]="d"/>
                </svg>
              </div>
              <div class="step-title">{{ step.title }}</div>
              <div class="step-desc">{{ step.desc }}</div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════ TRUST STRIP ══ -->
    <section style="padding:4rem 2rem;max-width:1280px;margin:0 auto;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:2rem;">
        @for (t of trust; track t.label) {
          <div style="text-align:center;padding:2rem 1rem;">
            <div style="display:flex;justify-content:center;margin-bottom:1rem;">
              <svg [attr.viewBox]="t.svg.viewBox" width="32" height="32" fill="none" stroke="#c9a96e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path *ngFor="let d of t.svg.paths" [attr.d]="d"/>
              </svg>
            </div>
            <div style="font-family:'Cormorant Garamond',serif;font-size:1.1rem;font-weight:500;color:#1a1410;margin-bottom:0.375rem;">{{ t.label }}</div>
            <div style="font-family:'Jost',sans-serif;font-size:0.8rem;color:#9e9890;">{{ t.desc }}</div>
          </div>
        }
      </div>
    </section>

    <!-- ══════════════════════════════════════════ CTA BANNER ══ -->
    <div class="cta-banner">
      <div style="position:relative;max-width:700px;margin:0 auto;">
        <div class="section-eyebrow" style="color:#c9a96e;margin-bottom:1.25rem;">Limited Offer</div>
        <h2 class="cta-title">
          Free Delivery on<br>
          <em>Orders Over PKR 2,000</em>
        </h2>
        <p class="cta-sub">Cash on delivery available. No account needed. Shop now and glow up.</p>
        <a routerLink="/products" class="btn-gold" style="display:inline-flex;">
          Shop the Collection
        </a>
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  products = signal<Product[]>([]);

  stats = [
    { num: '500+', label: 'Products' },
    { num: '1.2K', label: 'Happy Customers' },
    { num: '4.9★', label: 'Avg Rating' },
  ];

  marqueeItems = [
    'Free Delivery over PKR 2,000',
    'Cash on Delivery',
    '100% Original Products',
    '7-Day Easy Returns',
    'WhatsApp Support',
    'Oriflame Certified',
    'Nationwide Delivery',
    'No Account Needed',
  ];

  categories = [
    {
      name: 'Skincare',
      desc: 'Serums, moisturizers & more',
      img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80'
    },
    {
      name: 'Makeup',
      desc: 'Lips, eyes & foundation',
      img: 'https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=600&q=80'
    },
    {
      name: 'Fragrance',
      desc: 'Perfumes & body mists',
      img: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80'
    },
    {
      name: 'Haircare',
      desc: 'Shampoos, masks & oils',
      img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80'
    },
  ];

  steps = [
    {
      no: 1, title: 'Browse & Select',
      desc: 'Explore our curated collection of premium beauty products. No login required.',
      svg: {
        viewBox: '0 0 24 24',
        paths: ['M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z']
      }
    },
    {
      no: 2, title: 'Place Your Order',
      desc: 'Add to cart, fill in your address and phone number — done in 60 seconds.',
      svg: {
        viewBox: '0 0 24 24',
        paths: [
          'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
        ]
      }
    },
    {
      no: 3, title: 'We Deliver',
      desc: 'Your order arrives at your door. Pay cash on delivery. Simple.',
      svg: {
        viewBox: '0 0 24 24',
        paths: [
          'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0'
        ]
      }
    },
  ];

  trust = [
    {
      label: 'Free Delivery', desc: 'On orders over PKR 2,000',
      svg: { viewBox: '0 0 24 24', paths: ['M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0'] }
    },
    {
      label: 'Cash on Delivery', desc: 'Pay when you receive',
      svg: { viewBox: '0 0 24 24', paths: ['M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'] }
    },
    {
      label: '7-Day Returns', desc: 'Hassle-free returns',
      svg: { viewBox: '0 0 24 24', paths: ['M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'] }
    },
    {
      label: '100% Original', desc: 'Certified authentic products',
      svg: { viewBox: '0 0 24 24', paths: ['M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'] }
    },
  ];

  ngOnInit() {
    this.productService.getProducts().subscribe(p => this.products.set(p.slice(0, 6)));
  }
}
