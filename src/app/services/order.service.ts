import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface OrderItem {
  laptopId: string;
  title: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  totalPrice: number;
  name: string;
  shippingAddress: string;
  orderNote?: string;
  status?: 'pending' | 'success' | 'fail';
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = 'https://api-gateway-bo9u.onrender.com/v1/orders';

  createOrder(orderData: any) {
    return this.http.post(this.apiUrl, orderData, { withCredentials: true });
  }

  getUserOrders() {
    return this.http.get<Order[]>(this.apiUrl, { withCredentials: true });
  }

  // Admin: fetch all orders (backend excludes payment fields)
  getAllOrders() {
    return this.http.get<Order[]>(`${this.apiUrl}/all`);
  }

  // Admin: update order status
  updateOrderStatus(id: string, status: 'pending' | 'success' | 'fail') {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/status`, {
      status,
    });
  }
}
