import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

export interface Laptop {
  _id: string;
  Brand: string;
  Model: string;
  Spec: string;
  category?: string;
  description?: string;
  image_url?: string;
  price: number;
  // Legacy-friendly fields from backend mapper
  genre?: string;
  coverImage?: string;
}

@Injectable({ providedIn: 'root' })
export class LaptopService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/v1/laptops';
  private categoryUrl = 'http://localhost:3000/v1/categories';

  laptops = signal<Laptop[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  searchQuery = signal<string>('');
  brands = signal<string[]>([]);
  categories = signal<string[]>([]);

  fetchLaptops() {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<Laptop[]>(this.apiUrl).subscribe({
      next: (data) => {
        console.log('Laptops fetched from backend:', data);
        this.laptops.set(data || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch laptops from backend:', err);
        this.error.set(
          'Failed to load laptops. Please make sure the backend is running.'
        );
        this.loading.set(false);
      },
    });
  }

  addLaptop(laptop: Omit<Laptop, '_id'>) {
    return this.http.post<Laptop>(this.apiUrl, laptop).pipe(
      map((newLaptop) => {
        // Update the signal with the new laptop
        this.laptops.update((laptops) => [...laptops, newLaptop]);
        return newLaptop;
      })
    );
  }

  updateLaptop(id: string, updates: Partial<Laptop>) {
    return this.http.put<Laptop>(`${this.apiUrl}/${id}`, updates).pipe(
      map((updatedLaptop) => {
        // Update the signal with the modified laptop
        this.laptops.update((laptops) =>
          laptops.map((laptop) => (laptop._id === id ? updatedLaptop : laptop))
        );
        return updatedLaptop;
      })
    );
  }

  deleteLaptop(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      map(() => {
        // Remove the laptop from the signal
        this.laptops.update((laptops) =>
          laptops.filter((laptop) => laptop._id !== id)
        );
        return id;
      })
    );
  }

  setSearchQuery(query: string) {
    console.log('[LaptopService] Setting search query:', query);
    this.searchQuery.set(query);
  }

  clearSearch() {
    this.searchQuery.set('');
  }

  // Fetch brands from backend
  fetchBrands() {
    return this.http
      .get<{ brands: string[] }>(`${this.categoryUrl}/brands`)
      .pipe(
        map((response) => {
          this.brands.set(response.brands || []);
          return response.brands;
        })
      );
  }

  // Fetch categories from backend
  fetchCategories() {
    return this.http
      .get<{ categories: string[] }>(`${this.categoryUrl}/laptop-categories`)
      .pipe(
        map((response) => {
          this.categories.set(response.categories || []);
          return response.categories;
        })
      );
  }

  // Add a new brand
  addBrand(brand: string) {
    return this.http
      .post<{ brands: string[] }>(`${this.categoryUrl}/brands`, { brand })
      .pipe(
        map((response) => {
          this.brands.set(response.brands || []);
          return response.brands;
        })
      );
  }

  // Add a new category
  addCategory(category: string) {
    return this.http
      .post<{ categories: string[] }>(`${this.categoryUrl}/categories`, {
        category,
      })
      .pipe(
        map((response) => {
          this.categories.set(response.categories || []);
          return response.categories;
        })
      );
  }
}
