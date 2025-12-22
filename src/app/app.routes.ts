import { Routes } from '@angular/router';
import { Homescreen } from './homescreen/homescreen';
import { Cart } from './cart/cart';
import { About } from './about/about';
import { Payment } from './payment/payment';
import { Admin } from './admin/admin';
import { AdminLogin } from './admin-login/admin-login';
import { Profile } from './profile/profile';
import { authGuard } from './auth.guard';
import { adminGuard } from './admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Homescreen },
  { path: 'cart', component: Cart, canActivate: [authGuard] },
  { path: 'payment', component: Payment },
  { path: 'about', component: About },
  { path: 'admin-login', component: AdminLogin },
  { path: 'admin', component: Admin, canActivate: [adminGuard] },
  { path: 'profile', component: Profile },
  { path: '**', redirectTo: 'home' },
];
