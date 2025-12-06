import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  // HOME (requiere autenticación)
  {
    path: '',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage),
    canActivate: [AuthGuard],
    data: { requiresAuth: true }
  },

  // AUTH - Sin protección (acceso público)
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.page').then(m => m.LoginPage),
    data: { requiresGuest: true }
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register.page').then(m => m.RegisterPage),
    data: { requiresGuest: true }
  },

  // PRODUCTS - Catálogo público (requiere autenticación)
  {
    path: 'products',
    children: [
      {
        path: '',
        loadComponent: () => import('./products/product-list/product-list.page').then(m => m.ProductListPage),
        canActivate: [AuthGuard],
        data: { requiresAuth: true }
      },
      {
        path: ':id',
        loadComponent: () => import('./products/product-detail/product-detail.page').then(m => m.ProductDetailPage),
        canActivate: [AuthGuard],
        data: { requiresAuth: true }
      }
    ]
  },

// CART - Carrito (requiere autenticación)
  {
    path: 'cart',
    // Corregido según la estructura visible: ./cart/cart-page/nombre_archivo
    loadComponent: () => import('./cart/cart-page/cart-page.page').then(m => m.CartPage),
    canActivate: [AuthGuard],
    data: { requiresAuth: true }
  },

  // CHECKOUT - Proceso de compra (requiere autenticación)
{
  path: 'checkout',
  // ¡Utiliza esta ruta si el archivo está en src/app/cart/checkout/!
  loadComponent: () => import('./cart/checkout/checkout.page').then(m => m.CheckoutPage),
  canActivate: [AuthGuard],
  data: { requiresAuth: true }
},
  // ORDER CONFIRMATION - Confirmación de pedido (requiere autenticación)
  {
    path: 'order-confirmation',
    loadComponent: () => import('./order-confirmation/order-confirmation.page').then(m => m.OrderConfirmationPage),
    canActivate: [AuthGuard],
    data: { requiresAuth: true }
  },

  // MY ORDERS - Mis pedidos (requiere autenticación)
  {
    path: 'my-orders',
    loadComponent: () => import('./my-orders/my-orders.page').then(m => m.MyOrdersPage),
    canActivate: [AuthGuard],
    data: { requiresAuth: true }
  },

  // ADMIN - Panel administrativo (requiere autenticación + rol admin)
  {
    path: 'admin',
    canActivate: [AuthGuard],
    data: { requiresAuth: true, role: 'admin' },
    children: [
      {
        path: '',
        loadComponent: () => import('./admin/dashboard/dashboard.page').then(m => m.DashboardPage)
      },
      {
        path: 'users',
        children: [
          {
            path: '',
            loadComponent: () => import('./admin/users/user-list/user-list.page').then(m => m.UserListPage)
          }
        ]
      },
      {
        path: 'products',
        children: [
          {
            path: '',
            loadComponent: () => import('./admin/products/product-list/product-list.page').then(m => m.AdminProductListPage)
          },
          {
            path: 'new',
            loadComponent: () => import('./admin/products/product-form/product-form.page').then(m => m.ProductFormPage)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./admin/products/product-form/product-form.page').then(m => m.ProductFormPage)
          }
        ]
      },
      {
        path: 'categories',
        children: [
          {
            path: '',
            loadComponent: () => import('./admin/categories/category-list/category-list.page').then(m => m.CategoryListPage)
          },
          {
            path: 'new',
            loadComponent: () => import('./admin/categories/category-form/category-form.page').then(m => m.CategoryFormPage)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./admin/categories/category-form/category-form.page').then(m => m.CategoryFormPage)
          }
        ]
      },
      {
        path: 'orders',
        children: [
          {
            path: '',
            loadComponent: () => import('./admin/orders/order-list.page').then(m => m.AdminOrderListPage)
          }
        ]
      }
    ]
  },

  // 404 - Ruta no encontrada
  {
    path: '**',
    redirectTo: ''
  }

];