import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  styles: [`
    footer {
      background: #1a1410;
      color: #9e9890;
    }
    .footer-top {
      max-width: 1280px;
      margin: 0 auto;
      padding: 5rem 2rem 4rem;
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 3rem;
    }
    @media (max-width: 900px) { .footer-top { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 480px) { .footer-top { grid-template-columns: 1fr; } }

    .brand-name {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.75rem;
      font-weight: 400;
      color: #faf7f4;
      letter-spacing: 0.06em;
      margin-bottom: 0.25rem;
    }
    .brand-tagline {
      font-family: 'Jost', sans-serif;
      font-size: 0.65rem;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #c9a96e;
      margin-bottom: 1.25rem;
    }
    .brand-desc {
      font-family: 'Jost', sans-serif;
      font-size: 0.85rem;
      line-height: 1.8;
      color: #6b6560;
      max-width: 260px;
      margin-bottom: 1.5rem;
    }
    .footer-pills { display: flex; flex-direction: column; gap: 0.5rem; }
    .footer-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-family: 'Jost', sans-serif;
      font-size: 0.75rem;
      color: #6b6560;
    }
    .footer-pill span:first-child { color: #c9a96e; }

    .col-title {
      font-family: 'Jost', sans-serif;
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #faf7f4;
      margin-bottom: 1.5rem;
    }
    .col-links { list-style: none; display: flex; flex-direction: column; gap: 0.75rem; }
    .col-links a, .col-links span {
      font-family: 'Jost', sans-serif;
      font-size: 0.85rem;
      color: #6b6560;
      text-decoration: none;
      transition: color 0.2s;
      cursor: pointer;
    }
    .col-links a:hover, .col-links span:hover { color: #c9a96e; }

    .footer-bottom {
      border-top: 1px solid rgba(255,255,255,0.06);
      padding: 1.5rem 2rem;
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .footer-copy {
      font-family: 'Jost', sans-serif;
      font-size: 0.75rem;
      color: #4a4540;
    }
    .footer-gold-line {
      height: 1px;
      background: linear-gradient(90deg, transparent, #c9a96e40, transparent);
    }
  `],
  template: `
    <footer>
      <div class="footer-gold-line"></div>
      <div class="footer-top">

        <!-- Brand -->
        <div>
          <div class="brand-name">GlowMart</div>
          <div class="brand-tagline">Premium Beauty</div>
          <p class="brand-desc">
            Curated beauty &amp; skincare products delivered to your door. No account needed — just shop and glow.
          </p>
          <div class="footer-pills">
            <div class="footer-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>
              Free delivery over PKR 2,000
            </div>
            <div class="footer-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              Cash on Delivery
            </div>
            <div class="footer-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
              100% Original Products
            </div>
          </div>
        </div>

        <!-- Shop -->
        <div>
          <div class="col-title">Shop</div>
          <ul class="col-links">
            <li><a routerLink="/products">All Products</a></li>
            <li><a routerLink="/products" [queryParams]="{category:'Skincare'}">Skincare</a></li>
            <li><a routerLink="/products" [queryParams]="{category:'Makeup'}">Makeup</a></li>
            <li><a routerLink="/products" [queryParams]="{category:'Fragrance'}">Fragrance</a></li>
            <li><a routerLink="/products" [queryParams]="{category:'Haircare'}">Haircare</a></li>
          </ul>
        </div>

        <!-- Info -->
        <div>
          <div class="col-title">Info</div>
          <ul class="col-links">
            <li><span>Cash on Delivery</span></li>
            <li><span>Easy Returns</span></li>
            <li><span>WhatsApp Support</span></li>
            <li><span>Track Your Order</span></li>
          </ul>
        </div>

        <!-- Seller -->
        <div>
          <div class="col-title">Seller</div>
          <ul class="col-links">
            <li><a routerLink="/seller/login">Seller Login</a></li>
            <li><a routerLink="/seller/dashboard">Dashboard</a></li>
            <li><a routerLink="/seller/products">Manage Products</a></li>
            <li><a routerLink="/seller/orders">View Orders</a></li>
          </ul>
        </div>

      </div>

      <div style="border-top:1px solid rgba(255,255,255,0.05);">
        <div class="footer-bottom">
          <span class="footer-copy">© 2025 GlowMart. All rights reserved.</span>
          <span class="footer-copy" style="color:#c9a96e;">Made with care from Pakistan</span>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}
