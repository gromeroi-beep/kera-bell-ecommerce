import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product-service';
import { Product } from '../../../core/models/product.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-admin-product-list',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule],
  templateUrl: './product-list.page.html',
  styleUrls: ['./product-list.page.scss']
})
export class AdminProductListPage implements OnInit, OnDestroy {

  private productService = inject(ProductService);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  private router = inject(Router);

  products = signal<Product[]>([]);
  loading = signal(true);
  isDeleting = signal(false);
  searchTerm = signal('');

  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.loadProducts();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga los productos
   */
  loadProducts() {
    this.loading.set(true);

    this.productService.products$()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.products.set(data);
          console.log('✅ Productos cargados:', data.length);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('❌ Error cargando productos:', err);
          this.loading.set(false);
          this.showToast('Error al cargar productos', 'danger');
        }
      });
  }

  /**
   * Obtiene productos filtrados por búsqueda
   */
  get filteredProducts(): Product[] {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.products();
    return this.products().filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term)
    );
  }

  /**
   * Navega hacia atrás
   */
  goBack() {
    console.log('⬅️ Volviendo al dashboard');
    this.router.navigate(['/admin']);
  }

  /**
   * Navega a crear nuevo producto
   */
  goToCreate() {
    console.log('➕ Crear nuevo producto');
    this.router.navigate(['/admin/products/new']);
  }

  /**
   * Navega a editar un producto
   */
  goToEdit(id: string | undefined) {
    if (!id) {
      this.showToast('Error: ID inválido', 'danger');
      return;
    }
    console.log('✏️ Editando producto:', id);
    this.router.navigate(['/admin/products/edit', id]);
  }

  /**
   * Muestra confirmación antes de eliminar
   */
  async deleteProduct(id: string | undefined, name: string) {
    if (!id) {
      this.showToast('Error: ID inválido', 'danger');
      return;
    }

    const alert = await this.alertController.create({
      header: '⚠️ Eliminar Producto',
      message: `¿Estás seguro de que deseas eliminar <strong>"${name}"</strong>?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.executeDelete(id, name);
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Ejecuta la eliminación
   */
  private async executeDelete(id: string, name: string) {
    this.isDeleting.set(true);

    try {
      await this.productService.deleteProduct(id);
      console.log('✅ Producto eliminado:', id);
      this.showToast(`✅ "${name}" eliminado correctamente`, 'success');
      await this.loadProducts();
    } catch (error) {
      console.error('❌ Error eliminando producto:', error);
      this.showToast('❌ Error al eliminar el producto', 'danger');
    } finally {
      this.isDeleting.set(false);
    }
  }

  /**
   * Formatea la fecha
   */
  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Muestra un toast
   */
  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'top',
      color
    });
    await toast.present();
  }
}