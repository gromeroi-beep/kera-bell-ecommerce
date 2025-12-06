import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonImg,
  IonBadge,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonText,
  IonSpinner,
  ToastController,
} from '@ionic/angular/standalone';

import { ProductService } from '../../core/services/product-service';
import { CartService } from '../../core/services/cart.service';
import { Product, CartItem } from '../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonImg,
    IonBadge,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonText,
    IonSpinner,
  ],
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
})
export class ProductDetailPage implements OnInit {
  product: Product | null = null;
  isLoading = false;
  quantity = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadProduct();
  }

  /**
   * Carga el producto desde la ruta
   */
  loadProduct(): void {
    this.isLoading = true;

    this.route.params.subscribe((params) => {
      const productId = params['id'];

      if (productId) {
        this.productService
          .getById(productId)
          .then((product) => {
            this.product = product;
            if (!this.product) {
              console.error('❌ Producto no encontrado');
              this.showToast('Producto no encontrado', 'danger');
            } else {
              console.log('✅ Producto cargado:', this.product.name);
            }
          })
          .catch((error) => {
            console.error('❌ Error cargando producto:', error);
            this.showToast('Error al cargar el producto', 'danger');
          })
          .finally(() => {
            this.isLoading = false;
          });
      }
    });
  }

  /**
   * Incrementa la cantidad
   */
  incrementQuantity(): void {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  /**
   * Decrementa la cantidad
   */
  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  /**
   * Valida que la cantidad esté dentro de los límites permitidos
   * Se ejecuta cuando el usuario ingresa un número directamente
   */
  validateQuantity(): void {
    if (!this.product) return;

    // Mínimo 1
    if (this.quantity < 1) {
      this.quantity = 1;
    }

    // No puede exceder el stock
    if (this.quantity > this.product.stock) {
      this.quantity = this.product.stock;
      this.showToast(`❌ Solo hay ${this.product.stock} disponibles`, 'warning');
    }
  }

  /**
   * Agrega el producto al carrito
   */
  addToCart(): void {
    if (this.product && this.quantity > 0) {
      const cartItem: CartItem = {
        product: this.product,
        quantity: this.quantity,
      };

      this.cartService.addItem(cartItem);
      console.log('🛒 Producto agregado:', this.product.name);

      // Mostrar confirmación
      this.showToast(
        `✅ ${this.quantity} unidad(es) de "${this.product.name}" agregada(s) al carrito`,
        'success'
      );

      // Resetear cantidad
      this.quantity = 1;
    }
  }

  /**
   * Navega al carrito
   */
  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  /**
   * Vuelve al catálogo
   */
  goBack(): void {
    this.router.navigate(['/products']);
  }

  /**
   * Muestra un toast
   */
  private async showToast(
    message: string,
    color: string = 'primary'
  ): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color,
    });
    await toast.present();
  }
}