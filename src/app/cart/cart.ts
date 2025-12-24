import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Trash2 } from 'lucide-angular';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  cart = inject(CartService);
  private router = inject(Router);
  readonly Trash2 = Trash2;

  ngOnInit() {
    // Sync cart with backend on page load
    console.log('[Cart Page] Syncing cart with backend on page load');
    this.cart.fetchCart();
  }

  increaseQuantity(item: any) {
    this.cart.increase(item);
  }

  decreaseQuantity(item: any) {
    // If quantity is 1, remove the item when minus is clicked
    if (item.quantity <= 1) {
      this.removeItem(item);
    } else {
      this.cart.decrease(item);
    }
  }

  removeItem(item: any) {
    this.cart.remove(item);
  }

  getTotal() {
    return this.cart.getTotal();
  }

  checkout() {
    this.router.navigate(['/payment']);
  }

  continueShopping() {
    this.router.navigate(['/']);
  }
}
