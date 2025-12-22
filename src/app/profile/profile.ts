import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService, Order } from '../services/order.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class Profile {
  private orderService = inject(OrderService);

  orders = signal<Order[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.fetchOrders();
  }

  fetchOrders() {
    this.loading.set(true);
    this.error.set(null);

    console.log('[Profile] Fetching order history...');

    this.orderService.getUserOrders().subscribe({
      next: (orders) => {
        console.log('[Profile] Orders fetched:', orders);
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('[Profile] Failed to fetch orders:', err);
        this.error.set('Failed to load order history. Please try again.');
        this.loading.set(false);
      },
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
