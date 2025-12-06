import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon,
  IonButtons,
  IonBackButton,
  IonThumbnail,
  IonItemDivider,
  IonBadge,
  IonInput,
  AlertController,
  ToastController,
} from '@ionic/angular/standalone';

import { CartService } from '../../core/services/cart.service';
import { CartItem } from '../../core/models/product.model';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonCard,
    IonCardContent,
    IonIcon,
    IonButtons,
    IonBackButton,
    IonThumbnail,
    IonItemDivider,
    IonInput,
  ],
  templateUrl: './cart-page.page.html',
  styleUrls: ['./cart-page.page.scss'],
})
export class CartPage implements OnInit, OnDestroy {
  cartItems$ = this.cartService.items$;
  cartTotal$ = this.cartService.total$;
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    console.log('🛒 Carrito inicializado');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Actualiza la cantidad de un producto en el carrito
   */
  updateItemQuantity(productId: string, event: any) {
    const newQuantity = parseInt(event.detail?.value || '0', 10);

    if (isNaN(newQuantity) || newQuantity < 0) {
      this.showToast('Cantidad inválida', 'danger');
      return;
    }

    if (newQuantity === 0) {
      this.removeItem(productId);
    } else {
      this.cartService.updateQuantity(productId, newQuantity);
      this.showToast('✅ Cantidad actualizada', 'success');
    }
  }

  /**
   * Elimina un item del carrito
   */
  async removeItem(productId: string) {
    const alert = await this.alertController.create({
      header: 'Eliminar producto',
      message: '¿Deseas eliminar este producto del carrito?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.cartService.removeItem(productId);
            this.showToast('🗑️ Producto eliminado', 'success');
          },
        },
      ],
    });

    await alert.present();
  }

  /**
   * Navega al checkout
   */
  goToCheckout() {
    this.cartItems$.subscribe((items) => {
      if (items && items.length > 0) {
        this.router.navigate(['/checkout']);
      } else {
        this.showToast('El carrito está vacío', 'warning');
      }
    });
  }

  /**
   * Limpia todo el carrito
   */
  async clearCart() {
    const alert = await this.alertController.create({
      header: 'Limpiar carrito',
      message: '¿Deseas eliminar todos los productos del carrito?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Limpiar',
          role: 'destructive',
          handler: () => {
            this.cartService.clearCart();
            this.showToast('🧹 Carrito vaciado', 'success');
          },
        },
      ],
    });

    await alert.present();
  }

  /**
   * Vuelve al catálogo de productos
   */
  continueShopping() {
    this.router.navigate(['/products']);
  }

  /**
   * Muestra un toast (notificación)
   */
  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color,
    });

    await toast.present();
  }
}