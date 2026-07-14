import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
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
      align-items: center;
      background: #faf7f4;
      overflow: hidden;
    }
    @media (max-width: 900px) {
      .hero { grid-template-columns: 1fr; }
      .hero-carousel-side { display: none; }
    }

    /* Left content */
    .hero-content {
      padding: 6rem 3rem 6rem 8rem;
      display: flex; flex-direction: column; justify-content: center;
    }
    @media (max-width: 1200px) { .hero-content { padding: 4rem 2rem 4rem 4rem; } }

    .hero-eyebrow {
      font-family: 'Jost', sans-serif;
      font-size: 0.7rem; font-weight: 500;
      letter-spacing: 0.3em; text-transform: uppercase;
      color: #c9a96e; margin-bottom: 1.5rem;
      display: flex; align-items: center; gap: 0.75rem;
    }
    .hero-eyebrow::after { content: ''; width: 40px; height: 1px; background: #c9a96e; }

    .hero-title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: clamp(3.2rem, 5vw, 5.5rem);
      font-weight: 300; line-height: 1.05;
      color: #1a1410; margin-bottom: 1.5rem;
    }
    .hero-title em {
      font-style: italic; font-weight: 400;
      background: linear-gradient(135deg, #c9a96e, #8b6914);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }

    .hero-desc {
      font-family: 'Jost', sans-serif;
      font-size: 0.95rem; color: #6b6560;
      line-height: 1.8; max-width: 420px; margin-bottom: 2.5rem;
    }

    .hero-btns { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 3rem; }

    .hero-stats {
      display: flex; gap: 2.5rem;
      padding-top: 2rem; border-top: 1px solid #ddd8d0;
    }
    .stat-num {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.75rem; font-weight: 600; color: #1a1410; line-height: 1;
    }
    .stat-label {
      font-family: 'Jost', sans-serif; font-size: 0.7rem;
      letter-spacing: 0.1em; text-transform: uppercase; color: #9e9890; margin-top: 0.25rem;
    }

    /* ── Right: Cross Carousel ───────────────────────────── */
    .hero-carousel-side {
      position: relative;
      height: 100%;
      min-height: 92vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .carousel-track {
      position: relative;
      width: 320px;
      height: 480px;
    }

    .c-card {
      position: absolute;
      width: 200px;
      height: 270px;
      border-radius: 4px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
      top: 50%;
      left: 50%;
      margin-top: -135px;
      margin-left: -100px;
    }

    .c-card img {
      width: 100%; height: 100%;
      object-fit: cover;
      display: block;
    }

    /* CENTER — active */
    .c-card.pos-center {
      transform: translate(0, 0) scale(1);
      z-index: 5;
      filter: none;
      box-shadow: 0 28px 70px rgba(26,20,16,0.30);
      width: 220px;
      height: 300px;
      margin-top: -150px;
      margin-left: -110px;
    }

    /* TOP */
    .c-card.pos-top {
      transform: translate(0, -230px) scale(0.72);
      z-index: 3;
      filter: blur(2.5px) brightness(0.6);
      box-shadow: 0 8px 24px rgba(26,20,16,0.12);
    }

    /* BOTTOM */
    .c-card.pos-bottom {
      transform: translate(0, 230px) scale(0.72);
      z-index: 3;
      filter: blur(2.5px) brightness(0.6);
      box-shadow: 0 8px 24px rgba(26,20,16,0.12);
    }

    /* LEFT */
    .c-card.pos-left {
      transform: translate(-230px, 0) scale(0.72);
      z-index: 3;
      filter: blur(2.5px) brightness(0.6);
      box-shadow: 0 8px 24px rgba(26,20,16,0.12);
    }

    /* RIGHT */
    .c-card.pos-right {
      transform: translate(230px, 0) scale(0.72);
      z-index: 3;
      filter: blur(2.5px) brightness(0.6);
      box-shadow: 0 8px 24px rgba(26,20,16,0.12);
    }

    /* Hidden — extra slides waiting off-screen */
    .c-card.pos-hidden {
      transform: translate(0, 0) scale(0.3);
      z-index: 1;
      opacity: 0;
      pointer-events: none;
    }

    /* Label on active card only */
    .c-card-label {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      padding: 1.5rem 1rem 1rem;
      background: linear-gradient(to top, rgba(26,20,16,0.85) 0%, transparent 100%);
      opacity: 0;
      transition: opacity 0.4s;
    }
    .c-card.pos-center .c-card-label { opacity: 1; }

    .c-label-cat {
      font-family: 'Jost', sans-serif; font-size: 0.6rem;
      letter-spacing: 0.2em; text-transform: uppercase;
      color: #c9a96e; margin-bottom: 0.2rem;
    }
    .c-label-name {
      font-family: 'Cormorant Garamond', serif; font-size: 1.1rem;
      font-weight: 500; color: #fff;
    }

    /* Dots */
    .carousel-dots {
      position: absolute; bottom: 1.5rem;
      width: 100%; display: flex; gap: 0.5rem;
      align-items: center; justify-content: center;
    }
    .cdot {
      width: 20px; height: 2px;
      background: #ddd8d0; border: none; padding: 0; cursor: pointer;
      transition: all 0.3s;
    }
    .cdot.active { width: 36px; background: #c9a96e; }

    /* ── Marquee ──────────────────────────────────────────── */
    .marquee-bar { padding: 1.1rem 0; overflow: hidden; border-bottom: 1px solid #e8e0d6; }

    /* ── Section header ───────────────────────────────────── */
    .section-header { text-align: center; margin-bottom: 3.5rem; }
    .section-eyebrow {
      font-family: 'Jost', sans-serif; font-size: 0.7rem; font-weight: 500;
      letter-spacing: 0.25em; text-transform: uppercase; color: #c9a96e; margin-bottom: 0.875rem;
    }
    .section-title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: clamp(2rem, 3.5vw, 3rem); font-weight: 400; color: #1a1410; line-height: 1.15;
    }
    .section-title em { font-style: italic; }

    /* ── Category grid ────────────────────────────────────── */
    .cat-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem;
    }
    @media (max-width: 1024px) { .cat-grid { grid-template-columns: repeat(3,1fr); } }
    @media (max-width: 768px)  { .cat-grid { grid-template-columns: repeat(2,1fr); gap: 1rem; } }

    .cat-card { position: relative; overflow: hidden; cursor: pointer; text-decoration: none; display: block; }
    .cat-img { aspect-ratio: 4/5; overflow: hidden; position: relative; }
    .cat-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94); display: block; }
    .cat-card:hover .cat-img img { transform: scale(1.08); }
    .cat-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(26,20,16,0) 40%, rgba(26,20,16,0.75) 100%); }
    .cat-info { position: absolute; bottom: 0; left: 0; right: 0; padding: 1.25rem 1rem; }
    .cat-name { font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; font-weight: 500; color: #fff; margin-bottom: 0.15rem; }
    .cat-desc { font-family: 'Jost', sans-serif; font-size: 0.72rem; color: rgba(255,255,255,0.6); margin-bottom: 0.5rem; }
    .cat-arrow { font-family: 'Jost', sans-serif; font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase; color: #c9a96e; opacity: 0; transform: translateY(6px); transition: all 0.3s ease; display: flex; align-items: center; gap: 4px; }
    .cat-card:hover .cat-arrow { opacity: 1; transform: translateY(0); }

    /* ── Products grid ────────────────────────────────────── */
    .products-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 2rem; }
    @media (max-width: 900px) { .products-grid { grid-template-columns: repeat(2,1fr); gap: 1.5rem; } }
    @media (max-width: 480px) { .products-grid { grid-template-columns: 1fr; } }

    /* ── How it works ─────────────────────────────────────── */
    .steps-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 0; }
    @media (max-width: 768px) { .steps-grid { grid-template-columns: 1fr; } }
    .step-item { padding: 3rem 2.5rem; border-right: 1px solid #e8e0d6; text-align: center; }
    .step-item:last-child { border-right: none; }
    @media (max-width: 768px) { .step-item { border-right: none; border-bottom: 1px solid #e8e0d6; } .step-item:last-child { border-bottom: none; } }
    .step-num { font-family: 'Cormorant Garamond', serif; font-size: 3.5rem; font-weight: 300; color: #e8e0d6; line-height: 1; margin-bottom: 1rem; }
    .step-icon { display:flex; justify-content:center; margin-bottom: 1rem; }
    .step-title { font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; font-weight: 500; color: #1a1410; margin-bottom: 0.75rem; }
    .step-desc { font-family: 'Jost', sans-serif; font-size: 0.85rem; color: #9e9890; line-height: 1.7; }

    /* ── CTA banner ───────────────────────────────────────── */
    .cta-banner { background: rgba(250,247,244,0.96); padding: 5rem 2rem; text-align: center; position: relative; overflow: hidden; border-top: 1px solid #e8e0d6; }
    .cta-banner::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, #c9a96e, transparent); pointer-events: none; }
    .cta-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 300; color: #1a1410; line-height: 1.15; margin-bottom: 1.25rem; letter-spacing: 0.02em; }
    .cta-title em { font-style: italic; background: linear-gradient(135deg, #c9a96e, #8b6914); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .cta-sub { font-family: 'Jost', sans-serif; font-size: 0.85rem; letter-spacing: 0.1em; color: #6b6560; margin-bottom: 2.5rem; max-width: 400px; margin-left: auto; margin-right: auto; }
    .cta-eyebrow { font-family: 'Jost', sans-serif; font-size: 0.65rem; font-weight: 500; letter-spacing: 0.3em; text-transform: uppercase; color: #c9a96e; margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: center; gap: 0.75rem; }
    .cta-eyebrow::before, .cta-eyebrow::after { content: ''; width: 40px; height: 1px; background: rgba(201,169,110,0.5); }
  `],
  template: `

    <!-- ══════════════════════════════════════════════ HERO ══ -->
    <section class="hero">

      <!-- Left: Content -->
      <div class="hero-content">
        <div class="hero-eyebrow">Everything in One Place</div>
        <h1 class="hero-title">
          Shop <em>Everything</em><br>You Love
        </h1>
        <p class="hero-desc">
          Fashion, beauty, kitchen, electronics, accessories &amp; more —
          all delivered to your door. Cash on delivery. No account needed.
        </p>
        <div class="hero-btns">
          <a routerLink="/products" class="btn-primary">Shop Now</a>
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

      <!-- Right: 3D Card Carousel -->
      <div class="hero-carousel-side">
        <div class="carousel-track">
          @for (slide of heroSlides; track slide.id; let i = $index) {
            <div class="c-card" [ngClass]="getCardClass(i)" (click)="goToSlide(i)">
              <img [src]="slide.img" [alt]="slide.name" loading="lazy" />
              <div class="c-card-label">
                <div class="c-label-cat">{{ slide.category }}</div>
                <div class="c-label-name">{{ slide.name }}</div>
              </div>
            </div>
          }
        </div>

        <!-- Dots -->
        <div class="carousel-dots">
          @for (slide of heroSlides; track slide.id; let i = $index) {
            <button class="cdot" [class.active]="currentSlide() === i" (click)="goToSlide(i)"></button>
          }
        </div>
      </div>

    </section>

    <!-- ══════════════════════════════════════════ MARQUEE ══ -->
    <div class="marquee-bar">
      <div style="display:flex;gap:3rem;align-items:center;">
        @for (item of marqueeItems.concat(marqueeItems); track $index) {
          <span style="font-family:'Jost',sans-serif;font-size:18px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#1a1410;white-space:nowrap;flex-shrink:0;display:flex;align-items:center;gap:0.75rem;">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="#c9a96e"><rect x="4" y="0" width="5.66" height="5.66" transform="rotate(45 4 0)"/></svg>
            {{ item }}
          </span>
        }
      </div>
    </div>

    <!-- ══════════════════════════════════════════ CATEGORIES ══ -->
    <section id="categories" style="padding:6rem 2rem;max-width:1280px;margin:0 auto;">
      <div class="section-header">
        <div class="section-eyebrow">Browse</div>
        <h2 class="section-title">Shop by <em>Category</em></h2>
      </div>
      <div class="cat-grid">
        @for (cat of categories; track cat.name) {
          <a routerLink="/products" [queryParams]="{category: cat.name}" class="cat-card">
            <div class="cat-img">
              <img [src]="cat.img" [alt]="cat.name" loading="lazy" />
              <div class="cat-overlay"></div>
            </div>
            <div class="cat-info">
              <div class="cat-name">{{ cat.name }}</div>
              <div class="cat-desc">{{ cat.desc }}</div>
              <div class="cat-arrow">
                Shop Now
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </div>
          </a>
        }
      </div>
    </section>

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
          View All
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
        <div class="cta-eyebrow">Limited Offer</div>
        <h2 class="cta-title">Free Delivery on<br><em>Orders Over PKR 2,000</em></h2>
        <p class="cta-sub">Cash on delivery available. No account needed. Shop everything you love.</p>
        <a routerLink="/products" class="btn-gold" style="display:inline-flex;">Shop Now</a>
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  products = signal<Product[]>([]);
  currentSlide = signal(0);
  private slideInterval: any;

  heroSlides = [
    { id: 0, category: 'Fashion',     name: 'Clothing & Apparel',  img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
    { id: 1, category: 'Beauty',      name: 'Makeup & Skincare',   img: 'https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=600&q=80' },
    { id: 2, category: 'Electronics', name: 'Gadgets & Tech',      img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80' },
    { id: 3, category: 'Kitchen',     name: 'Home & Kitchen',      img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80' },
    { id: 4, category: 'Accessories', name: 'Bags & Jewellery',    img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80' },
    { id: 5, category: 'Sports',      name: 'Fitness & Sport',     img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80' },
    { id: 6, category: 'Kids',        name: 'Toys & Baby',         img: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600&q=80' },
  ];

  // Cross layout: center, top, right, bottom, left
  // Rotation order: top comes to center, center goes to bottom-hidden,
  // right comes to top, left comes to right, new card comes from left
  // Positions cycle: 0=center, 1=top, 2=right, 3=bottom, 4=left
  getCardClass(i: number): string {
    const total = this.heroSlides.length;
    const active = this.currentSlide();
    // position slot relative to active
    let diff = ((i - active) % total + total) % total;

    switch (diff) {
      case 0: return 'pos-center';
      case 1: return 'pos-top';
      case 2: return 'pos-right';
      case 3: return 'pos-bottom';
      case 4: return 'pos-left';
      default: return 'pos-hidden';
    }
  }

  goToSlide(i: number) {
    this.currentSlide.set(i);
    clearInterval(this.slideInterval);
    this.startAutoPlay();
  }

  startAutoPlay() {
    this.slideInterval = setInterval(() => {
      // Rotation: top → center (active increments by 1, so next top slot becomes center)
      this.currentSlide.set((this.currentSlide() + 1) % this.heroSlides.length);
    }, 3500);
  }

  stats = [
    { num: '1000+', label: 'Products' },
    { num: '5K+',   label: 'Happy Customers' },
    { num: '4.9★',  label: 'Avg Rating' },
  ];

  marqueeItems = [
    'Free Delivery over PKR 2,000', 'Cash on Delivery',
    '100% Original Products', '7-Day Easy Returns',
    'Fashion · Beauty · Electronics', 'Kitchen · Accessories · More',
    'Nationwide Delivery', 'No Account Needed',
  ];

  categories = [
    { name: 'Clothing',       desc: 'Men, Women & Kids fashion',        img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
    { name: 'Beauty',         desc: 'Skincare, makeup & fragrance',      img: 'https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=600&q=80' },
    { name: 'Electronics',    desc: 'Gadgets, phones & accessories',     img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80' },
    { name: 'Kitchen',        desc: 'Cookware, appliances & utensils',   img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80' },
    { name: 'Bedsheets',      desc: 'Bedding, pillows & comforters',     img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80' },
    { name: 'Accessories',    desc: 'Bags, jewelry & watches',           img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80' },
    { name: 'Sports',         desc: 'Fitness gear & sportswear',         img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80' },
    { name: 'Kids & Toys',    desc: 'Toys, games & baby products',       img: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600&q=80' },
    { name: 'Home Decor',     desc: 'Furnishings & decorative items',    img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80' },
    { name: 'Daily Gadgets',  desc: 'Smart home & everyday essentials',  img: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&q=80' },
    { name: 'Footwear',       desc: 'Shoes, sandals & boots',            img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80' },
    { name: 'Stationery',     desc: 'Office, school & art supplies',     img: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=600&q=80' },
  ];

  steps = [
    { no: 1, title: 'Browse & Select',  desc: 'Explore thousands of products across all categories. No login required.', svg: { viewBox: '0 0 24 24', paths: ['M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'] } },
    { no: 2, title: 'Place Your Order', desc: 'Add to cart, fill in your address and phone number — done in 60 seconds.', svg: { viewBox: '0 0 24 24', paths: ['M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'] } },
    { no: 3, title: 'We Deliver',       desc: 'Your order arrives at your door. Pay cash on delivery. Simple.', svg: { viewBox: '0 0 24 24', paths: ['M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0'] } },
  ];

  trust = [
    { label: 'Free Delivery',    desc: 'On orders over PKR 2,000',   svg: { viewBox: '0 0 24 24', paths: ['M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0'] } },
    { label: 'Cash on Delivery', desc: 'Pay when you receive',        svg: { viewBox: '0 0 24 24', paths: ['M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'] } },
    { label: '7-Day Returns',    desc: 'Hassle-free returns',         svg: { viewBox: '0 0 24 24', paths: ['M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'] } },
    { label: '100% Original',   desc: 'Certified authentic products', svg: { viewBox: '0 0 24 24', paths: ['M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'] } },
  ];

  ngOnInit() {
    this.productService.getProducts().subscribe(p => this.products.set(p.slice(0, 6)));
    this.startAutoPlay();
  }

  ngOnDestroy() { clearInterval(this.slideInterval); }
}
