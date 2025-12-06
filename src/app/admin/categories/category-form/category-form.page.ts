import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CategoryService, Category } from '../../../core/services/category.service';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.page.html',
  styleUrls: ['./category-form.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class CategoryFormPage implements OnInit, OnDestroy {

  route = inject(ActivatedRoute);
  router = inject(Router);
  categoryService = inject(CategoryService);
  toastController = inject(ToastController);
  fb = inject(FormBuilder);

  categoryForm!: FormGroup;
  isEditMode = false;
  categoryId: string | null = null;
  pageTitle: string = 'Nueva Categoría';
  isSaving = false;
  formSubmitted = false;

  ngOnInit() {
    this.categoryId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.categoryId;

    if (this.isEditMode) {
      this.pageTitle = 'Editar Categoría';
    }

    this.initForm();

    if (this.isEditMode && this.categoryId) {
      this.loadCategoryData(this.categoryId);
    }
  }

  ngOnDestroy() {
    console.log('🛑 Category Form Page destruido');
  }

  /**
   * Inicializa el formulario reactivo
   */
  initForm() {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]]
    });
  }

  /**
   * Carga los datos de la categoría para editar
   */
  loadCategoryData(id: string) {
    const found = this.categoryService.categories().find(c => c.id === id);
    
    if (found) {
      this.categoryForm.patchValue({
        name: found.name
      });
      console.log('✅ Categoría cargada:', found.name);
    } else {
      console.error('❌ Categoría no encontrada:', id);
      this.showToast('Categoría no encontrada', 'danger');
      this.router.navigate(['/admin/categories']);
    }
  }

  /**
   * Guarda la categoría (crear o actualizar)
   */
  async save() {
    // Prevenir múltiples submissions
    if (this.formSubmitted || this.isSaving) {
      console.warn('⚠️ Guardado ya en progreso');
      return;
    }

    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      await this.showToast('Por favor completa todos los campos correctamente', 'warning');
      console.warn('⚠️ Formulario inválido');
      return;
    }

    this.formSubmitted = true;
    this.isSaving = true;

    const data: Category = this.categoryForm.value;

    try {
      if (this.isEditMode && this.categoryId) {
        await this.categoryService.updateCategory(this.categoryId, data);
        await this.showToast('✅ Categoría actualizada correctamente', 'success');
        console.log('✅ Categoría actualizada:', this.categoryId);
      } else {
        await this.categoryService.addCategory(data);
        await this.showToast('✅ Categoría creada correctamente', 'success');
        console.log('✅ Categoría creada');
      }

      // Navegar después de un pequeño delay
      setTimeout(() => {
        this.router.navigate(['/admin/categories']);
      }, 800);

    } catch (error) {
      console.error('❌ Error guardando categoría:', error);
      await this.showToast('❌ Error al guardar la categoría', 'danger');
      this.isSaving = false;
      this.formSubmitted = false;
    }
  }

  /**
   * Navega atrás
   */
  goBack() {
    this.router.navigate(['/admin/categories']);
  }

  /**
   * Muestra un toast
   */
  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'top',
      color,
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
}