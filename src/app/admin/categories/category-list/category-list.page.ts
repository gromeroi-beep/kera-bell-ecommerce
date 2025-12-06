import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { CategoryService, Category } from '../../../core/services/category.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  templateUrl: './category-list.page.html',
  styleUrls: ['./category-list.page.scss']
})
export class CategoryListPage implements OnInit, OnDestroy {

  private categoryService = inject(CategoryService);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  private router = inject(Router);

  categories = signal<Category[]>([]);
  loading = signal(true);
  isDeleting = signal(false);

  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.loadCategories();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga las categorías
   */
  loadCategories() {
    this.loading.set(true);

    this.categoryService.categories$()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.categories.set(data);
          console.log('✅ Categorías cargadas:', data.length);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('❌ Error cargando categorías:', err);
          this.loading.set(false);
          this.showToast('Error al cargar categorías', 'danger');
        }
      });
  }

  /**
   * Navega hacia atrás
   */
  goBack() {
    console.log('⬅️ Volviendo al dashboard');
    this.router.navigate(['/admin']);
  }

  /**
   * Navega a crear nueva categoría
   */
  goToCreate() {
    console.log('➕ Crear nueva categoría');
    this.router.navigate(['/admin/categories/new']);
  }

  /**
   * Navega a editar una categoría
   */
  goToEdit(id: string | undefined) {
    if (!id) {
      this.showToast('Error: ID inválido', 'danger');
      return;
    }
    console.log('✏️ Editando categoría:', id);
    this.router.navigate(['/admin/categories/edit', id]);
  }

  /**
   * Muestra confirmación antes de eliminar
   */
  async deleteCategory(id: string | undefined, name: string) {
    if (!id) {
      this.showToast('Error: ID inválido', 'danger');
      return;
    }

    const alert = await this.alertController.create({
      header: '⚠️ Eliminar Categoría',
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
      const success = await this.categoryService.deleteCategory(id);
      
      if (success) {
        console.log('✅ Categoría eliminada:', id);
        this.showToast(`✅ "${name}" eliminada correctamente`, 'success');
        await this.loadCategories();
      } else {
        this.showToast('❌ Error al eliminar la categoría', 'danger');
      }
    } catch (error) {
      console.error('❌ Error eliminando categoría:', error);
      this.showToast('❌ Error al eliminar la categoría', 'danger');
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