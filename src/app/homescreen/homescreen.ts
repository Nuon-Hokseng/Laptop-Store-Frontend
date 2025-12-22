import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../services/cart.service';
import { LaptopService } from '../services/item.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { PopupService } from '../shared/popup.service';

@Component({
  selector: 'app-homescreen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './homescreen.html',
  styleUrls: ['./homescreen.css'],
})
export class Homescreen {
  private cart = inject(CartService);
  laptopService = inject(LaptopService); // Make public for template access
  private router = inject(Router);
  private popup = inject(PopupService);

  // toast UI state for add-to-cart confirmation
  toastVisible = false;
  toastMessage = '';

  categories = [
    'All',
    'Ultrabook',
    'Gaming',
    'Business',
    '2-in-1',
    'Creator',
    'Modular',
  ];
  selectedCategory = 'All';

  brands = ['All', 'Apple', 'Dell', 'HP', 'ASUS', 'Lenovo', 'MSI'];
  selectedBrand = 'All';

  get laptops() {
    const allLaptops = this.laptopService.laptops();
    const searchQuery = this.laptopService.searchQuery().toLowerCase().trim();

    let filtered = allLaptops;

    // Filter by category
    if (this.selectedCategory !== 'All') {
      filtered = filtered.filter(
        (laptop) => (laptop.category || laptop.genre) === this.selectedCategory
      );
    }

    // Filter by brand
    if (this.selectedBrand !== 'All') {
      filtered = filtered.filter(
        (laptop) =>
          (laptop.Brand || '').toLowerCase() ===
          this.selectedBrand.toLowerCase()
      );
    }

    // Filter by search query (search in brand, model, spec, and category)
    if (searchQuery) {
      filtered = filtered.filter((laptop) => {
        const brand = (laptop.Brand || '').toLowerCase();
        const model = (laptop.Model || '').toLowerCase();
        const spec = (laptop.Spec || '').toLowerCase();
        const category = (laptop.category || laptop.genre || '').toLowerCase();
        return (
          brand.includes(searchQuery) ||
          model.includes(searchQuery) ||
          spec.includes(searchQuery) ||
          category.includes(searchQuery)
        );
      });
    }

    return filtered;
  }

  constructor() {
    this.laptopService.fetchLaptops();
  }

  addToCart(laptop: any) {
    const authed = localStorage.getItem('isAuthenticated') === 'true';
    if (!authed) {
      this.popup.show('Please log in to add items to your cart.', {
        type: 'error',
        durationMs: 2500,
      });
      // Stay on page; user can click Login from navbar
      return;
    }
    const name = `${laptop.Brand} ${laptop.Model}`;
    this.cart.add({
      title: name,
      author: laptop.Brand,
      price: laptop.price,
      genre: laptop.category,
      laptopId: laptop._id,
      coverImage: laptop.coverImage || laptop.image_url,
    });
    this.showToast(`${name} added to cart`);
  }

  purchase(laptop: any) {
    const authed = localStorage.getItem('isAuthenticated') === 'true';
    if (!authed) {
      this.popup.show('Please log in before purchasing.', {
        type: 'error',
        durationMs: 2500,
      });
      return;
    }
    // add the single item and navigate to payment
    const name = `${laptop.Brand} ${laptop.Model}`;
    this.cart.add({
      title: name,
      author: laptop.Brand,
      price: laptop.price,
      genre: laptop.category,
      laptopId: laptop._id, // Pass laptop ID for backend sync
      coverImage: laptop.coverImage || laptop.image_url, // Pass cover image URL
      quantity: 1,
    });
    // navigate to payment screen
    this.router.navigate(['/payment']);
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
  }

  selectBrand(brand: string) {
    this.selectedBrand = brand;
  }

  clearSearch() {
    console.log('[Homescreen] Clearing search');
    this.laptopService.clearSearch();
  }

  private showToast(msg: string, ms = 1800) {
    this.toastMessage = msg;
    this.toastVisible = true;
    setTimeout(() => (this.toastVisible = false), ms);
  }
}
