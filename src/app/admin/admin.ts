import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LaptopService, Laptop } from '../services/item.service';
import { AdminAuthService } from '../services/admin-auth.service';
import { PopupService } from '../shared/popup.service';
import { Router } from '@angular/router';
import { OrderService, Order } from '../services/order.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
})
export class Admin {
  laptopService = inject(LaptopService);
  private router = inject(Router);
  private adminAuth = inject(AdminAuthService);
  private popup = inject(PopupService);
  private orderService = inject(OrderService);

  laptops = this.laptopService.laptops;
  loading = this.laptopService.loading;
  error = this.laptopService.error;
  showAddForm = false;

  // Tabs: 'laptops' | 'orders'
  activeTab: 'laptops' | 'orders' = 'laptops';

  // Orders state
  orders = signal<Order[]>([]);
  ordersLoading = signal<boolean>(false);
  ordersError = signal<string | null>(null);
  savingOrderId = signal<string | null>(null);

  newLaptop = {
    Brand: '',
    Model: '',
    Spec: '',
    price: 0,
    category: 'Ultrabook',
    description: '',
    image_url: '',
  };

  categories = [
    'Ultrabook',
    'Gaming',
    'Business',
    '2-in-1',
    'Creator',
    'Modular',
  ];

  constructor() {
    // Fetch laptops when admin page loads
    this.laptopService.fetchLaptops();
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
  }

  addLaptop() {
    if (
      !this.newLaptop.Brand ||
      !this.newLaptop.Model ||
      !this.newLaptop.Spec ||
      this.newLaptop.price <= 0
    ) {
      alert('Please fill in all required fields (Brand, Model, Spec, price)');
      return;
    }

    // Map frontend fields to backend fields
    const laptopData: any = {
      Brand: this.newLaptop.Brand,
      Model: this.newLaptop.Model,
      Spec: this.newLaptop.Spec,
      price: this.newLaptop.price,
      category: this.newLaptop.category,
      description: this.newLaptop.description,
      image_url: this.newLaptop.image_url,
    };

    this.laptopService.addLaptop(laptopData).subscribe({
      next: (laptop) => {
        console.log('Laptop added successfully:', laptop);
        alert(`Laptop "${laptop.Brand} ${laptop.Model}" added successfully!`);
        this.resetForm();
      },
      error: (err) => {
        console.error('Failed to add laptop:', err);
        alert('Failed to add laptop. Make sure the backend is running.');
      },
    });
  }

  deleteLaptop(laptop: Laptop) {
    const name = `${laptop.Brand} ${laptop.Model}`;
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    this.laptopService.deleteLaptop(laptop._id).subscribe({
      next: () => {
        console.log('Laptop deleted successfully');
        alert(`Laptop "${name}" deleted successfully!`);
      },
      error: (err) => {
        console.error('Failed to delete laptop:', err);
        alert('Failed to delete laptop. Make sure the backend is running.');
      },
    });
  }

  resetForm() {
    this.newLaptop = {
      Brand: '',
      Model: '',
      Spec: '',
      price: 0,
      category: 'Ultrabook',
      description: '',
      image_url: '',
    };
    this.showAddForm = false;
  }

  goBack() {
    this.router.navigate(['/']);
  }

  adminLogout() {
    this.adminAuth.logout();
    this.popup.show('Logged out of admin', {
      type: 'success',
      durationMs: 1200,
    });
    this.router.navigate(['/admin-login']);
  }

  setTab(tab: 'laptops' | 'orders') {
    this.activeTab = tab;
    if (tab === 'orders') {
      this.fetchAllOrders();
    }
  }

  private fetchAllOrders() {
    this.ordersLoading.set(true);
    this.ordersError.set(null);
    this.orderService.getAllOrders().subscribe({
      next: (list) => {
        this.orders.set(list || []);
        this.ordersLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch all orders:', err);
        this.ordersError.set('Failed to load orders.');
        this.ordersLoading.set(false);
      },
    });
  }

  onChangeStatus(orderId: string, status: 'pending' | 'success' | 'fail') {
    this.savingOrderId.set(orderId);
    this.orderService.updateOrderStatus(orderId, status).subscribe({
      next: (updated) => {
        // Update local list
        this.orders.update((curr) =>
          curr.map((o) =>
            o._id === orderId ? { ...o, status: updated.status } : o
          )
        );
        this.savingOrderId.set(null);
        this.popup.show('Order status updated', {
          type: 'success',
          durationMs: 1200,
        });
      },
      error: (err) => {
        console.error('Failed to update status:', err);
        this.savingOrderId.set(null);
        this.popup.show('Failed to update order status', {
          type: 'error',
          durationMs: 2200,
        });
      },
    });
  }
}
