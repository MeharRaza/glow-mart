import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  styles: [`
    :host { display: block; }

    .topbar {
      background: #1a1410;
      color: #c9a96e;
      text-align: center;
      padding: 0.5rem 1rem;
      font-family: 'Jost', sans-serif;
      font-size: 0.75rem;
      letter-spacing: 0.1em;
    }

    nav {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(250,247,244,0.96);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid #e8e0d6;
      transition: box-shadow 0.3s;
    }
    nav.scrolled {
      box-shadow: 0 4px 24px rgba(26,20,16,0.08);
    }

    .nav-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 2rem;
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-decoration: none;
      line-height: 1;
    }
    .logo-main {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.6rem;
      font-weight: 600;
      color: #1a1410;
      letter-spacing: 0.08em;
    }
    .logo-sub {
      font-family: 'Jost', sans-serif;
      font-size: 0.55rem;
      letter-spacing: 0.25em;
      color: #c9a96e;
      text-transform: uppercase;
      margin-top: -2px;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 2.5rem;
    }
    .nav-link {
      font-family: 'Jost', sans-serif;
      font-size: 0.8rem;
      font-weight: 500;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #6b6560;
      text-decoration: none;
      transition: color 0.2s;
      position: relative;
      padding-bottom: 2px;
    }
    .nav-link::after {
      content: '';
      position: absolute;
      bottom: -2px; left: 0; right: 0;
      height: 1px;
      background: #b8860b;
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }
    .nav-link:hover, .nav-link.active { color: #1a1410; }
    .nav-link:hover::after, .nav-link.active::after { transform: scaleX(1); }

    .nav-actions { display: flex; align-items: center; gap: 1rem; }

    .cart-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1.25rem;
      background: #1a1410;
      color: #faf7f4;
      font-family: 'Jost', sans-serif;
      font-size: 0.75rem;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      text-decoration: none;
      transition: background 0.2s;
      position: relative;
    }
    .cart-btn:hover { background: #2d2520; }
    .cart-count {
      background: #c9a96e;
      color: #fff;
      width: 18px; height: 18px;
      border-radius: 50%;
      font-size: 0.65rem;
      font-weight: 600;
      display: flex; align-items: center; justify-content: center;
    }

    .hamburger {
      display: none;
      flex-direction: column;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
    }
    .hamburger span {
      display: block;
      width: 24px; height: 1.5px;
      background: #1a1410;
      transition: all 0.3s;
    }

    .mobile-menu {
      background: #faf7f4;
      border-top: 1px solid #e8e0d6;
      padding: 1.5rem 2rem;
    }
    .mobile-link {
      display: block;
      padding: 0.875rem 0;
      border-bottom: 1px solid #f0ebe4;
      font-family: 'Jost', sans-serif;
      font-size: 0.85rem;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #6b6560;
      text-decoration: none;
      transition: color 0.2s;
    }
    .mobile-link:hover { color: #1a1410; }

    @media (max-width: 768px) {
      .nav-links { display: none; }
      .hamburger { display: flex; }
      .nav-inner { padding: 0 1.25rem; }
    }
  `],
  template: `
    <!-- Top announcement bar -->
    <div class="topbar">
      ✦ Free Delivery on Orders Over PKR 2,000 &nbsp;·&nbsp; Cash on Delivery Available ✦
    </div>

    <nav [class.scrolled]="scrolled">
      <div class="nav-inner">

        <!-- Logo -->
        <a routerLink="/" class="logo">
          <span class="logo-main">GlowMart</span>
          <span class="logo-sub">Premium Beauty</span>
        </a>

        <!-- Desktop links -->
        <div class="nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-link">Home</a>
          <a routerLink="/products" routerLinkActive="active" class="nav-link">Shop</a>
          <a routerLink="/products" [queryParams]="{category:'Skincare'}" class="nav-link">Skincare</a>
          <a routerLink="/products" [queryParams]="{category:'Makeup'}" class="nav-link">Makeup</a>
          <a routerLink="/seller/login" class="nav-link">Seller</a>
        </div>

        <!-- Actions -->
        <div class="nav-actions">
          <a routerLink="/cart" class="cart-btn">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            Bag
            @if (cart.totalItems() > 0) {
              <span class="cart-count">{{ cart.totalItems() }}</span>
            }
          </a>
          <button class="hamburger" (click)="mobileOpen.set(!mobileOpen())" aria-label="Menu">
            <span [style.transform]="mobileOpen() ? 'rotate(45deg) translate(5px,5px)' : ''"></span>
            <span [style.opacity]="mobileOpen() ? '0' : '1'"></span>
            <span [style.transform]="mobileOpen() ? 'rotate(-45deg) translate(5px,-5px)' : ''"></span>
          </button>
        </div>
      </div>

      @if (mobileOpen()) {
        <div class="mobile-menu">
          <a routerLink="/" (click)="mobileOpen.set(false)" class="mobile-link">Home</a>
          <a routerLink="/products" (click)="mobileOpen.set(false)" class="mobile-link">Shop All</a>
          <a routerLink="/products" [queryParams]="{category:'Skincare'}" (click)="mobileOpen.set(false)" class="mobile-link">Skincare</a>
          <a routerLink="/products" [queryParams]="{category:'Makeup'}" (click)="mobileOpen.set(false)" class="mobile-link">Makeup</a>
          <a routerLink="/cart" (click)="mobileOpen.set(false)" class="mobile-link">
            Bag @if (cart.totalItems() > 0) { ({{ cart.totalItems() }}) }
          </a>
          <a routerLink="/seller/login" (click)="mobileOpen.set(false)" class="mobile-link">Seller Login</a>
        </div>
      }
    </nav>
  `
})
export class NavbarComponent {
  cart = inject(CartService);
  mobileOpen = signal(false);
  scrolled = false;

  @HostListener('window:scroll')
  onScroll() { this.scrolled = window.scrollY > 10; }
}
