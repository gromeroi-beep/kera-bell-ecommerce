import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { ProductService } from '../../core/services/product-service';
import { UserService } from '../../core/services/user.service';
import { CategoryService } from '../../core/services/category.service';
import { OrderService } from '../../core/services/order.service';
import { Subject } from 'rxjs';
import { takeUntil, distinctUntilChanged, map } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss']
})
export class DashboardPage implements OnInit, OnDestroy {

  // Signals para los conteos
  usersCount = signal<number>(0);
  productsCount = signal<number>(0);
  categoriesCount = signal<number>(0);
  ordersCount = signal<number>(0);
  loading = signal<boolean>(true);

  private destroy$ = new Subject<void>();
  private statsLoaded = signal<number>(0);

  constructor(
    private router: Router,
    private productService: ProductService,
    private userService: UserService,
    private categoryService: CategoryService,
    private orderService: OrderService  // ✅ AGREGADO
  ) {}

  ngOnInit() {
    console.log('🎯 Dashboard inicializado');
    this.initStats();
  }

  ngOnDestroy() {
    console.log('🛑 Dashboard destruido');
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Inicializa todos los contadores
   */
  private initStats() {
    this.loading.set(true);

    // 📦 PRODUCTOS
    this.productService.products$()
      .pipe(
        takeUntil(this.destroy$),
        map(products => products.length),
        distinctUntilChanged()
      )
      .subscribe({
        next: (count) => {
          this.productsCount.set(count);
          console.log('✅ Productos actualizados EN DASHBOARD:', count);
          this.checkAllStatsLoaded();
        },
        error: (err) => {
          console.error('❌ Error en productos:', err);
          this.checkAllStatsLoaded();
        }
      });

    // 👥 USUARIOS
    this.userService.users$()
      .pipe(
        takeUntil(this.destroy$),
        map(users => users.length),
        distinctUntilChanged()
      )
      .subscribe({
        next: (count) => {
          this.usersCount.set(count);
          console.log('✅ Usuarios actualizados EN DASHBOARD:', count);
          this.checkAllStatsLoaded();
        },
        error: (err) => {
          console.error('❌ Error en usuarios:', err);
          this.checkAllStatsLoaded();
        }
      });

    // 📂 CATEGORÍAS
    this.categoryService.categories$()
      .pipe(
        takeUntil(this.destroy$),
        map(categories => categories.length),
        distinctUntilChanged()
      )
      .subscribe({
        next: (count) => {
          this.categoriesCount.set(count);
          console.log('✅ Categorías actualizadas EN DASHBOARD:', count);
          this.checkAllStatsLoaded();
        },
        error: (err) => {
          console.error('❌ Error en categorías:', err);
          this.checkAllStatsLoaded();
        }
      });

    // 📋 ÓRDENES - ✅ AHORA SÍ CARGA LOS DATOS
    this.orderService.orders$()
      .pipe(
        takeUntil(this.destroy$),
        map(orders => orders.length),
        distinctUntilChanged()
      )
      .subscribe({
        next: (count) => {
          this.ordersCount.set(count);
          console.log('✅ Órdenes actualizadas EN DASHBOARD:', count);
          this.checkAllStatsLoaded();
        },
        error: (err) => {
          console.error('❌ Error en órdenes:', err);
          // Si hay error, mantén en 0
          this.ordersCount.set(0);
          this.checkAllStatsLoaded();
        }
      });
  }

  /**
   * Verifica si todos los datos han sido cargados al menos una vez
   */
  private checkAllStatsLoaded() {
    const loaded = this.statsLoaded() + 1;
    this.statsLoaded.set(loaded);

    // Cuando los 4 servicios hayan emitido datos (ahora incluye órdenes)
    if (loaded >= 4) {
      this.loading.set(false);
      console.log('✅ TODOS LOS DATOS CARGADOS EN DASHBOARD');
    }
  }

  /**
   * Navega a una ruta
   */
  goTo(path: string) {
    console.log('📍 Navegando a:', path);
    this.router.navigate([path]);
  }

  /**
   * Navega hacia atrás
   */
  goBack() {
    console.log('⬅️ Volviendo atrás');
    this.router.navigate(['/']);
  }
}