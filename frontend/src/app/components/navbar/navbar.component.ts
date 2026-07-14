import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  styles: [`
    :host { display: block; }
    :host(.hidden) { display: none; }

    .topbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 101;
      background: #1a1410;
      color: #c9a96e;
      text-align: center;
      padding: 0.5rem 1rem;
      font-family: 'Jost', sans-serif;
      font-size: 0.75rem;
      letter-spacing: 0.1em;
    }

    nav {
      position: fixed;
      top: 34px;
      left: 0;
      right: 0;
      z-index: 100;
      background: rgba(250,247,244,0.96);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      transition: box-shadow 0.3s;
    }
    nav.scrolled { box-shadow: 0 4px 24px rgba(26,20,16,0.08); }

    .nav-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 2rem;
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo { display: flex; flex-direction: column; align-items: center; text-decoration: none; line-height: 1; cursor: pointer; }
    .logo-main { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.6rem; font-weight: 600; color: #1a1410; letter-spacing: 0.08em; }
    .logo-sub { font-family: 'Jost', sans-serif; font-size: 0.55rem; letter-spacing: 0.25em; color: #c9a96e; text-transform: uppercase; margin-top: -2px; }

    .nav-links { display: flex; align-items: center; gap: 2.5rem; }

    .nav-link {
      font-family: 'Jost', sans-serif; font-size: 0.8rem; font-weight: 500;
      letter-spacing: 0.12em; text-transform: uppercase; color: #6b6560;
      text-decoration: none; transition: color 0.2s; position: relative; padding-bottom: 2px;
      background: none; border: none; cursor: pointer;
    }
    .nav-link::after {
      content: ''; position: absolute; bottom: -2px; left: 0; right: 0;
      height: 1px; background: #b8860b; transform: scaleX(0); transition: transform 0.3s ease;
    }
    .nav-link:hover, .nav-link.active { color: #1a1410; }
    .nav-link:hover::after, .nav-link.active::after { transform: scaleX(1); }

    .shop-wrapper {
      position: relative;
      padding-bottom: 8px; /* extends hover zone down to meet the menu */
    }

    .mega-menu {
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      width: 780px;
      background: #fff;
      border: 1px solid #e8e0d6;
      box-shadow: 0 12px 40px rgba(26,20,16,0.10);
      z-index: 200;
    }

    .mega-tabs {
      display: flex; flex-wrap: wrap;
      border-bottom: 1px solid #e8e0d6;
      padding: 0 1.5rem;
    }
    .mega-tab {
      font-family: 'Jost', sans-serif; font-size: 0.78rem; font-weight: 500;
      letter-spacing: 0.08em; text-transform: capitalize; color: #6b6560;
      padding: 0.9rem 1rem; cursor: pointer;
      border-bottom: 2px solid transparent; margin-bottom: -1px;
      transition: color 0.2s, border-color 0.2s; white-space: nowrap;
      background: none; border-top: none; border-left: none; border-right: none;
    }
    .mega-tab:hover { color: #1a1410; }
    .mega-tab.active { color: #1a1410; border-bottom: 2px solid #1a1410; }

    .mega-body { padding: 1.5rem 2rem 2rem; }

    .all-link {
      display: inline-flex; align-items: center; gap: 0.3rem;
      font-family: 'Jost', sans-serif; font-size: 0.78rem; font-weight: 600;
      letter-spacing: 0.06em; color: #1a1410; text-decoration: none; margin-bottom: 1.25rem;
    }
    .all-link:hover { color: #c9a96e; }

    .mega-cols { display: grid; grid-template-columns: repeat(3,1fr); gap: 0 2rem; }
    .mega-col-title {
      font-family: 'Jost', sans-serif; font-size: 0.65rem; font-weight: 600;
      letter-spacing: 0.18em; text-transform: uppercase; color: #1a1410; margin-bottom: 0.75rem;
    }
    .mega-col ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.45rem; }
    .mega-col ul li a { font-family: 'Jost', sans-serif; font-size: 0.82rem; color: #6b6560; text-decoration: none; transition: color 0.2s; }
    .mega-col ul li a:hover { color: #1a1410; }

    .nav-actions { display: flex; align-items: center; gap: 1rem; }

    .cart-btn {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.5rem 1.25rem; background: #1a1410; color: #faf7f4;
      font-family: 'Jost', sans-serif; font-size: 0.75rem; font-weight: 500;
      letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; transition: background 0.2s;
    }
    .cart-btn:hover { background: #2d2520; }
    .cart-count {
      background: #c9a96e; color: #fff; width: 18px; height: 18px;
      border-radius: 50%; font-size: 0.65rem; font-weight: 600;
      display: flex; align-items: center; justify-content: center;
    }

    .hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 0.25rem; }
    .hamburger span { display: block; width: 24px; height: 1.5px; background: #1a1410; transition: all 0.3s; }

    .mobile-menu { background: #faf7f4; border-top: 1px solid #e8e0d6; padding: 1.5rem 2rem; }
    .mobile-link {
      display: block; padding: 0.875rem 0; border-bottom: 1px solid #f0ebe4;
      font-family: 'Jost', sans-serif; font-size: 0.85rem; font-weight: 500;
      letter-spacing: 0.1em; text-transform: uppercase; color: #6b6560; text-decoration: none; transition: color 0.2s;
    }
    .mobile-link:hover { color: #1a1410; }

    @media (max-width: 768px) {
      .nav-links { display: none; }
      .hamburger { display: flex; }
      .nav-inner { padding: 0 1.25rem; }
      .mega-menu { width: 100vw; left: 0; transform: none; }
    }
  `],
  template: `
    @if (!isSellerRoute()) {
    <div class="topbar">
      ✦ Free Delivery on Orders Over PKR 2,000 &nbsp;·&nbsp; Cash on Delivery Available ✦
    </div>

    <nav [class.scrolled]="scrolled">
      <div class="nav-inner">

        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="logo">
          <span class="logo-main">Shopzee</span>
          <span class="logo-sub">Premium Beauty</span>
        </a>

        <div class="nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-link">Home</a>

          <a routerLink="/products" routerLinkActive="active" class="nav-link">Shop</a>

          <a routerLink="/signup" class="nav-link">Sign Up</a>
          <a routerLink="/seller/login" class="nav-link">Seller</a>
        </div>

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
          @for (cat of shopCategories; track cat.name) {
            <a routerLink="/products" [queryParams]="{category: cat.name}" (click)="mobileOpen.set(false)" class="mobile-link">{{ cat.name }}</a>
          }
          <a routerLink="/signup" (click)="mobileOpen.set(false)" class="mobile-link">Sign Up</a>
          <a routerLink="/cart" (click)="mobileOpen.set(false)" class="mobile-link">
            Bag @if (cart.totalItems() > 0) { ({{ cart.totalItems() }}) }
          </a>
          <a routerLink="/seller/login" (click)="mobileOpen.set(false)" class="mobile-link">Seller Login</a>
        </div>
      }
    </nav>
    }
  `
})
export class NavbarComponent {
  cart = inject(CartService);
  private router = inject(Router);
  mobileOpen = signal(false);
  shopOpen = signal(false);
  activeTab = signal('Skincare');
  scrolled = false;

  isSellerRoute() {
    return this.router.url.startsWith('/seller');
  }

  @HostListener('window:scroll')
  onScroll() { this.scrolled = window.scrollY > 10; }

  shopCategories = [
    {
      name: 'Clothing',
      cols: [
        { title: 'Women', items: ['Kurtas & Suits', 'Dresses & Frocks', 'Tops & T-Shirts', 'Trousers & Palazzos', 'Abayas & Modest Wear', 'Winterwear'] },
        { title: 'Men', items: ['Shalwar Kameez', 'Shirts & Polos', 'Trousers & Jeans', 'Jackets & Coats', 'Waistcoats', 'Kurtas'] },
        { title: 'Kids', items: ['Boys Clothing', 'Girls Clothing', 'Baby & Infant', 'School Uniforms', 'Sleepwear'] },
      ]
    },
    {
      name: 'Beauty',
      cols: [
        { title: 'Skincare', items: ['Cleansers & Toners', 'Serums & Essences', 'Moisturisers', 'Sunscreen & SPF', 'Face Masks', 'Eye Cream'] },
        { title: 'Makeup', items: ['Foundation & Concealer', 'Lipstick & Gloss', 'Mascara & Eyeliner', 'Eyeshadow', 'Blush & Bronzer', 'Setting Powder'] },
        { title: 'Fragrance & Hair', items: ['Perfumes EDP', 'Body Mists', 'Shampoo & Conditioner', 'Hair Oils', 'Hair Masks', 'Styling Products'] },
      ]
    },
    {
      name: 'Electronics',
      cols: [
        { title: 'Phones & Tablets', items: ['Smartphones', 'Tablets', 'Phone Cases', 'Screen Protectors', 'Chargers & Cables', 'Power Banks'] },
        { title: 'Audio & Visual', items: ['Earbuds & Headphones', 'Bluetooth Speakers', 'Smart Watches', 'Cameras', 'Projectors'] },
        { title: 'Computers', items: ['Laptops', 'Keyboards & Mice', 'USB Hubs & Adapters', 'Webcams', 'Laptop Bags'] },
      ]
    },
    {
      name: 'Daily Gadgets',
      cols: [
        { title: 'Smart Home', items: ['LED Smart Bulbs', 'Smart Plugs', 'Security Cameras', 'Door Bells', 'Air Purifiers'] },
        { title: 'Personal Care', items: ['Electric Shavers', 'Hair Dryers', 'Straighteners', 'Trimmers', 'Massagers'] },
        { title: 'Everyday Essentials', items: ['Mini Fans', 'Neck Pillows', 'Cable Organizers', 'Portable Chargers', 'Wireless Gadgets'] },
      ]
    },
    {
      name: 'Kitchen',
      cols: [
        { title: 'Cookware', items: ['Non-stick Pans', 'Pressure Cookers', 'Pots & Casseroles', 'Woks & Kadais', 'Bakeware'] },
        { title: 'Appliances', items: ['Blenders & Juicers', 'Air Fryers', 'Rice Cookers', 'Electric Kettles', 'Toasters'] },
        { title: 'Dining & Storage', items: ['Crockery Sets', 'Glasses & Mugs', 'Lunch Boxes', 'Food Containers', 'Cutlery Sets'] },
      ]
    },
    {
      name: 'Bedsheets',
      cols: [
        { title: 'Bedding', items: ['Double Bed Sheets', 'Single Bed Sheets', 'King Size Sheets', 'Fitted Sheets', 'Pillow Covers'] },
        { title: 'Comfort', items: ['Duvets & Quilts', 'Comforters', 'Blankets', 'Mattress Protectors', 'Bed Cushions'] },
        { title: 'Pillows & More', items: ['Sleeping Pillows', 'Decorative Cushions', 'Bolster Pillows', 'Mattress Toppers'] },
      ]
    },
    {
      name: 'Home Decor',
      cols: [
        { title: 'Living Room', items: ['Wall Art & Frames', 'Vases & Pots', 'Candles & Holders', 'Rugs & Carpets', 'Curtains'] },
        { title: 'Lighting', items: ['Table Lamps', 'Fairy Lights', 'Night Lights', 'Pendant Lights', 'LED Strips'] },
        { title: 'Organisation', items: ['Storage Baskets', 'Drawer Organisers', 'Shelves & Racks', 'Bathroom Accessories'] },
      ]
    },
    {
      name: 'Accessories',
      cols: [
        { title: 'Bags & Luggage', items: ['Handbags', 'Backpacks', 'Clutches', 'Wallets', 'Travel Bags', 'Sling Bags'] },
        { title: 'Jewellery', items: ['Earrings', 'Necklaces', 'Bracelets', 'Rings', 'Hair Accessories', 'Bridal Sets'] },
        { title: 'Watches & More', items: ['Women Watches', 'Men Watches', 'Sunglasses', 'Belts', 'Scarves & Shawls'] },
      ]
    },
    {
      name: 'Sports',
      cols: [
        { title: 'Fitness', items: ['Dumbbells & Weights', 'Yoga Mats', 'Resistance Bands', 'Jump Ropes', 'Pull-up Bars'] },
        { title: 'Sportswear', items: ['Gym Shorts', 'Sports Bras', 'Track Suits', 'Running Shoes', 'Compression Wear'] },
        { title: 'Outdoor', items: ['Cricket Equipment', 'Football & Futsal', 'Badminton Sets', 'Cycling Accessories', 'Camping Gear'] },
      ]
    },
    {
      name: 'Kids & Toys',
      cols: [
        { title: 'Toys', items: ['Building Blocks', 'Remote Control Toys', 'Dolls & Playsets', 'Board Games', 'Puzzles'] },
        { title: 'Baby', items: ['Baby Clothes', 'Feeding Accessories', 'Diapers & Wipes', 'Baby Monitors', 'Strollers'] },
        { title: 'Education', items: ['Learning Toys', 'Art & Craft Kits', 'Books & Comics', 'Musical Instruments', 'Science Kits'] },
      ]
    },
    {
      name: 'Footwear',
      cols: [
        { title: 'Women', items: ['Heels & Pumps', 'Flats & Sandals', 'Sneakers', 'Boots', 'Khussa & Ethnic'] },
        { title: 'Men', items: ['Formal Shoes', 'Sneakers & Trainers', 'Sandals & Slippers', 'Boots', 'Loafers'] },
        { title: 'Kids', items: ['School Shoes', 'Sneakers', 'Sandals', 'Boots', 'Slippers'] },
      ]
    },
    {
      name: 'Stationery',
      cols: [
        { title: 'Office', items: ['Notebooks & Diaries', 'Pens & Markers', 'Files & Folders', 'Staplers & Punchers', 'Sticky Notes'] },
        { title: 'Art Supplies', items: ['Sketch Books', 'Color Pencils', 'Watercolors', 'Canvas & Brushes', 'Calligraphy Sets'] },
        { title: 'School', items: ['Geometry Sets', 'School Bags', 'Pencil Cases', 'Calculators', 'Flash Cards'] },
      ]
    },
  ];
}
