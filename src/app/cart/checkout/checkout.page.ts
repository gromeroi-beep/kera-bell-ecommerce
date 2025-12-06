// src/app/cart/checkout/checkout.page.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { CartService } from 'src/app/core/services/cart.service';
import { OrderService } from 'src/app/core/services/order.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CartItem } from 'src/app/core/models/product.model';
import { Order } from 'src/app/core/models/product.model';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class CheckoutPage implements OnInit {

  cartItems: CartItem[] = [];
  cartTotal: number = 0;
  userEmail: string = '';
  shippingAddress: string = '';
  paymentMethod: string = 'credit-card';
  isLoading = false;
  isProcessing = false;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.cartService.items$.subscribe(items => {
      this.cartItems = items;
    });

    this.cartService.total$.subscribe(total => {
      this.cartTotal = total;
    });

    const currentUser = (this.authService as any).currentUser;
    if (currentUser) {
      this.userEmail = currentUser.email;
    }
  }

  isFormValid(): boolean {
    return (
      this.shippingAddress.trim().length > 0 &&
      this.paymentMethod.trim().length > 0 &&
      this.cartItems.length > 0 &&
      this.cartTotal > 0
    );
  }

  async processCheckout() {
    if (!this.isFormValid()) {
      alert('Por favor completa todos los campos del formulario.');
      return;
    }

    this.isProcessing = true;

    try {
      const currentUser = (this.authService as any).currentUser;
      if (!currentUser) {
        alert('Debes estar logueado para completar la compra.');
        this.router.navigate(['/login']);
        return;
      }

      const orderItems = this.cartItems.map(item => ({
        productId: item.product.id || '',
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        subtotal: item.product.price * item.quantity
      }));

      const newOrder: Order = {
        userId: currentUser.uid,
        items: orderItems,
        shippingAddress: this.shippingAddress,
        totalAmount: this.cartTotal,
        paymentMethod: this.paymentMethod,
        status: 'Pending',
        createdAt: new Date()
      };

      const orderId = await this.orderService.createOrder(newOrder);

      this.cartService.clearCart();

      this.router.navigate(['/order-confirmation'], {
        queryParams: { orderId: orderId }
      });

      console.log('[OK] Compra realizada exitosamente. ID de orden:', orderId);

    } catch (error) {
      console.error('[ERROR] Error al procesar el pago:', error);
      alert('Ocurrio un error al procesar tu pago. Intenta de nuevo.');
    } finally {
      this.isProcessing = false;
    }
  }

  goBackToCart() {
    this.router.navigate(['/cart']);
  }
}