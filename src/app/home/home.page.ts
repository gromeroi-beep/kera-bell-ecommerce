import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subject, BehaviorSubject, combineLatest } from 'rxjs';
import { takeUntil, debounceTime, map, startWith } from 'rxjs/operators';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonSpinner,
  IonGrid,
  IonRow,
  IonCol,
  IonItemDivider,
  IonLabel,
  IonImg,
  IonSearchbar,
  IonBadge,
  IonButtons,
  ToastController,
} from '@ionic/angular/standalone';

import { ProductService } from '../core/services/product-service';
import { CartService } from '../core/services/cart.service';
import { Product } from '../core/models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonCardTitle,
    IonButton,
    IonIcon,
    IonSpinner,
    IonGrid,
    IonRow,
    IonCol,
    IonItemDivider,
    IonLabel,
    IonImg,
    IonSearchbar,
    IonBadge,
    IonButtons,
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  // Observables
  filteredProducts$!: Observable<Product[]>;
  cartItemCount$!: Observable<number>;

  // Estado
  isLoading = false;
  searchTerm: string = '';

  // Subjects privados
  private searchTerm$ = new BehaviorSubject<string>('');
  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.initializeObservables();
    this.loadProducts();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Inicializa los observables
   */
  private initializeObservables(): void {
    // Filtrar productos según búsqueda
    this.filteredProducts$ = combineLatest([
      this.productService.products$(),
      this.searchTerm$.pipe(debounceTime(300))
    ]).pipe(
      map(([products, searchTerm]) => {
        // Mostrar solo 6 destacados en home
        let filtered = products.slice(0, 6);

        // Filtrar por búsqueda si hay texto
        if (searchTerm.trim()) {
          const search = searchTerm.toLowerCase();
          filtered = filtered.filter(
            (p) =>
              p.name.toLowerCase().includes(search) ||
              p.description?.toLowerCase().includes(search)
          );
        }

        return filtered;
      }),
      startWith([]),
      takeUntil(this.destroy$)
    );

    // Observable para contar items del carrito
    this.cartItemCount$ = this.cartService.items$.pipe(
      map((items) => items.length),
      startWith(0),
      takeUntil(this.destroy$)
    );
  }

  /**
   * Carga los productos desde el servicio
   */
  loadProducts(): void {
    this.isLoading = true;

    this.productService
      .products$()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products: Product[]) => {
          console.log('✅ Productos cargados:', products.length);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Error cargando productos:', error);
          this.showToast('Error al cargar productos', 'danger');
          this.isLoading = false;
        },
      });
  }

  /**
   * Maneja el evento de búsqueda
   */
  onSearch(event: any): void {
    const value = event?.detail?.value || '';
    this.searchTerm = value;
    this.searchTerm$.next(value);
  }

  /**
   * Navega al detalle del producto
   */
  viewProduct(productId: string | undefined): void {
    if (!productId) {
      this.showToast('ID de producto no válido', 'warning');
      return;
    }

    console.log('📄 Navegando al producto:', productId);
    this.router.navigate(['/products', productId]);
  }

  /**
   * Agrega un producto al carrito
   */
  addToCart(productId: string | undefined): void {
    if (!productId) {
      this.showToast('No se pudo agregar el producto', 'warning');
      return;
    }

    this.productService
      .products$()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products: Product[]) => {
          const product = products.find((p) => p.id === productId);
          if (product) {
            const cartItem = {
              product: product,
              quantity: 1
            };
            
            this.cartService.addItem(cartItem);
            this.showToast(
              `${product.name} agregado al carrito ✅`,
              'success'
            );
            console.log('🛒 Producto agregado:', product.name);
          } else {
            this.showToast('Producto no encontrado', 'warning');
          }
        },
        error: (error) => {
          console.error('❌ Error al agregar producto:', error);
          this.showToast('Error al agregar producto', 'danger');
        },
      });
  }

  /**
   * Navega a la página de todos los productos
   */
  viewAllProducts(): void {
    console.log('🛍️ Navegando a todos los productos');
    this.router.navigate(['/products']);
  }

  /**
   * Navega al carrito
   */
  goToCart(): void {
    console.log('🛒 Navegando al carrito');
    this.router.navigate(['/cart']);
  }

  /**
   * TrackBy para optimizar ngFor
   */
  trackByProductId(index: number, product: Product): string {
    return product.id || index.toString();
  }

  /**
   * Muestra un toast (notificación)
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