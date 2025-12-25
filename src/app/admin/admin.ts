import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Edit, Trash2 } from 'lucide-angular';
import {
  LaptopService,
  Laptop,
  CategoryEntity,
  CategoryType,
} from '../services/item.service';
import { AdminAuthService } from '../services/admin-auth.service';
import { PopupService } from '../shared/popup.service';
import { Router } from '@angular/router';
import { OrderService, Order } from '../services/order.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
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

  // Icons
  readonly Edit = Edit;
  readonly Trash2 = Trash2;

  // Tabs: 'laptops' | 'orders'
  activeTab: 'laptops' | 'orders' = 'laptops';

  // Orders state
  orders = signal<Order[]>([]);
  ordersLoading = signal<boolean>(false);
  ordersError = signal<string | null>(null);
  savingOrderId = signal<string | null>(null);

  // Editing state
  editingId = signal<string | null>(null);
  isSaving = signal<boolean>(false);
  editForm: any = {};
  updateSuccessCount = 0; // Counter for update success popups

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

  brands = signal<string[]>([]);

  // Keep ids so deletes can hit MongoDB
  private brandEntities = signal<CategoryEntity[]>([]);
  private categoryEntities = signal<CategoryEntity[]>([]);

  // Manage categories and brands
  showManageOptions = signal<boolean>(false);
  newBrandInput = '';
  newCategoryInput = '';

  constructor() {
    // Fetch laptops when admin page loads
    this.laptopService.fetchLaptops();
    // Fetch brands and categories from backend
    this.fetchBrandsAndCategories();
  }

  fetchBrandsAndCategories() {
    this.fetchCategoryType('brand');
    this.fetchCategoryType('category');
  }

  private fetchCategoryType(type: CategoryType) {
    this.laptopService.fetchCategoryEntities(type).subscribe({
      next: (entities) => {
        const names = (entities || []).map((e) => e.name);
        if (type === 'brand') {
          console.log('[Admin] Brand entities fetched from backend:', entities);
          this.brandEntities.set(entities || []);
          this.brands.set(names);
        } else {
          console.log(
            '[Admin] Category entities fetched from backend:',
            entities
          );
          this.categoryEntities.set(entities || []);
          this.categories = names.length
            ? names
            : [
                'Ultrabook',
                'Gaming',
                'Business',
                '2-in-1',
                'Creator',
                'Modular',
              ];
        }
      },
      error: (err) => {
        console.error(`[Admin] Failed to fetch ${type}s:`, err);
        if (type === 'brand') {
          this.brands.set([
            'Apple',
            'Dell',
            'HP',
            'Lenovo',
            'Asus',
            'Acer',
            'MSI',
            'Razer',
            'Microsoft',
          ]);
        }
      },
    });
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
        this.popup.show(`Laptop "${name}" deleted successfully!`, {
          type: 'success',
          durationMs: 2000,
        });
      },
      error: (err) => {
        console.error('Failed to delete laptop:', err);
        this.popup.show(
          'Failed to delete laptop. Make sure the backend is running.',
          {
            type: 'error',
            durationMs: 2500,
          }
        );
      },
    });
  }

  startEditing(laptop: Laptop) {
    this.editingId.set(laptop._id);
    this.editForm = {
      Brand: laptop.Brand,
      Model: laptop.Model,
      Spec: laptop.Spec,
      price: laptop.price,
      category: laptop.category,
      description: laptop.description || '',
      image_url: laptop.image_url || laptop.coverImage || '',
    };
  }

  cancelEdit() {
    this.editingId.set(null);
    this.editForm = {};
  }

  saveEdit() {
    const laptopId = this.editingId();
    if (!laptopId) return;

    if (
      !this.editForm.Brand ||
      !this.editForm.Model ||
      !this.editForm.Spec ||
      this.editForm.price <= 0
    ) {
      this.popup.show('Please fill in all required fields', {
        type: 'error',
        durationMs: 2000,
      });
      return;
    }

    this.isSaving.set(true);

    const updates = {
      Brand: this.editForm.Brand,
      Model: this.editForm.Model,
      Spec: this.editForm.Spec,
      price: this.editForm.price,
      category: this.editForm.category,
      description: this.editForm.description,
      image_url: this.editForm.image_url,
    };

    this.laptopService.updateLaptop(laptopId, updates).subscribe({
      next: (updated) => {
        console.log('Laptop updated successfully:', updated);
        // Show popup only for first 2 times
        if (this.updateSuccessCount < 2) {
          this.popup.show('Laptop updated successfully!', {
            type: 'success',
            durationMs: 2000,
          });
          this.updateSuccessCount++;
        }
        this.isSaving.set(false);
        this.editingId.set(null);
        this.editForm = {};
        // Refresh the list
        this.laptopService.fetchLaptops();
      },
      error: (err) => {
        console.error('Failed to update laptop:', err);
        this.popup.show('Failed to update laptop. Please try again.', {
          type: 'error',
          durationMs: 2500,
        });
        this.isSaving.set(false);
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
        // Silent update - no popup needed
      },
      error: (err) => {
        console.error('Failed to update status:', err);
        this.savingOrderId.set(null);
        // Silent error - just log it
      },
    });
  }

  toggleManageOptions() {
    this.showManageOptions.update((v) => !v);
  }

  addNewBrand() {
    const brand = this.newBrandInput.trim();
    if (!brand) {
      this.popup.show('Please enter a brand name', {
        type: 'error',
        durationMs: 1500,
      });
      return;
    }
    if (this.brands().includes(brand)) {
      this.popup.show('Brand already exists', {
        type: 'error',
        durationMs: 1500,
      });
      return;
    }

    // Add to backend
    this.laptopService.addBrand(brand).subscribe({
      next: (brands) => {
        this.brands.set(brands || []);
        this.newBrandInput = '';
        this.popup.show(`Brand "${brand}" added successfully`, {
          type: 'success',
          durationMs: 1500,
        });
      },
      error: (err) => {
        console.error('[Admin] Failed to add brand:', err);
        this.popup.show('Failed to add brand to database', {
          type: 'error',
          durationMs: 2000,
        });
      },
    });
  }

  removeBrand(brand: string) {
    if (
      !confirm(`Remove brand "${brand}"? This won't affect existing laptops.`)
    ) {
      return;
    }

    const entity = this.brandEntities().find((e) => e.name === brand);
    if (!entity?._id) {
      this.popup.show('Unable to delete: missing brand id', {
        type: 'error',
        durationMs: 2000,
      });
      return;
    }

    this.laptopService.deleteCategory(entity._id).subscribe({
      next: () => {
        this.brandEntities.update((curr) =>
          curr.filter((e) => e._id !== entity._id)
        );
        this.brands.update((curr) => curr.filter((b) => b !== brand));
        this.popup.show(`Brand "${brand}" deleted from database`, {
          type: 'success',
          durationMs: 1500,
        });
      },
      error: (err) => {
        console.error('[Admin] Failed to delete brand:', err);
        this.popup.show('Failed to delete brand from database', {
          type: 'error',
          durationMs: 2000,
        });
      },
    });
  }

  addNewCategory() {
    const category = this.newCategoryInput.trim();
    if (!category) {
      this.popup.show('Please enter a category name', {
        type: 'error',
        durationMs: 1500,
      });
      return;
    }
    if (this.categories.includes(category)) {
      this.popup.show('Category already exists', {
        type: 'error',
        durationMs: 1500,
      });
      return;
    }

    // Add to backend
    this.laptopService.addCategory(category).subscribe({
      next: (categories) => {
        this.categories = categories || [];
        this.newCategoryInput = '';
        this.popup.show(`Category "${category}" added successfully`, {
          type: 'success',
          durationMs: 1500,
        });
      },
      error: (err) => {
        console.error('[Admin] Failed to add category:', err);
        this.popup.show('Failed to add category to database', {
          type: 'error',
          durationMs: 2000,
        });
      },
    });
  }

  removeCategory(category: string) {
    if (
      !confirm(
        `Remove category "${category}"? This won't affect existing laptops.`
      )
    ) {
      return;
    }

    const entity = this.categoryEntities().find((e) => e.name === category);
    if (!entity?._id) {
      this.popup.show('Unable to delete: missing category id', {
        type: 'error',
        durationMs: 2000,
      });
      return;
    }

    this.laptopService.deleteCategory(entity._id).subscribe({
      next: () => {
        this.categoryEntities.update((curr) =>
          curr.filter((e) => e._id !== entity._id)
        );
        this.categories = this.categories.filter((c) => c !== category);
        this.popup.show(`Category "${category}" deleted from database`, {
          type: 'success',
          durationMs: 1500,
        });
      },
      error: (err) => {
        console.error('[Admin] Failed to delete category:', err);
        this.popup.show('Failed to delete category from database', {
          type: 'error',
          durationMs: 2000,
        });
      },
    });
  }
}
