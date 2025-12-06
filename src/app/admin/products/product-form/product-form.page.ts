import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from 'src/app/core/services/firebase-service';
import { ProductService } from 'src/app/core/services/product-service';
import { CategoryService, Category } from '@app/core/services/category.service';
import { Product } from 'src/app/core/models/product.model';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.page.html',
  styleUrls: ['./product-form.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ProductFormPage implements OnInit, OnDestroy {

  fb = inject(FormBuilder);
  route = inject(ActivatedRoute);
  router = inject(Router);
  firebaseService = inject(FirebaseService);
  productService = inject(ProductService);
  categoryService = inject(CategoryService);
  toastController = inject(ToastController);

  productForm!: FormGroup;
  isEditMode = false;
  productId: string | null = null;
  pageTitle: string = 'Crear Nuevo Producto';
  isSaving = false;
  formSubmitted = false;

  ngOnInit() {
    this.productId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.productId;

    this.initForm();

    if (this.isEditMode && this.productId) {
      this.pageTitle = 'Editar Producto';
      this.loadProductData(this.productId);
    }
  }

  ngOnDestroy() {
    console.log('🛑 Product Form Page destruido');
  }

  /**
   * Inicializa el formulario reactivo
   */
  initForm() {
    const urlRegex = /(http(s?):\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]/;

    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      price: [null, [Validators.required, Validators.min(0.01)]],
      stock: [null, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required], // ✅ NUEVA: Categoría obligatoria
      imageUrl: ['', [Validators.required, Validators.pattern(urlRegex)]],
      description: ['']
    });
  }

  /**
   * Carga los datos del producto para editar
   */
  async loadProductData(id: string) {
    try {
      const product = await this.productService.getById(id);
      if (product) {
        this.productForm.patchValue(product);
        console.log('✅ Producto cargado:', product.name);
      }
    } catch (error) {
      console.error('❌ Error cargando producto:', error);
      await this.showToast('Error al cargar el producto', 'danger');
    }
  }

  /**
   * Guarda el producto (crear o actualizar)
   */
  async saveProduct() {
    // Prevenir múltiples submissions
    if (this.formSubmitted || this.isSaving) {
      console.warn('⚠️ Guardado ya en progreso');
      return;
    }

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      await this.showToast('Por favor completa todos los campos correctamente', 'warning');
      return;
    }

    this.formSubmitted = true;
    this.isSaving = true;

    const data = this.productForm.value as Product;

    try {
      if (this.isEditMode && this.productId) {
        await this.productService.updateProduct(this.productId, data);
        await this.showToast('✅ Producto actualizado correctamente', 'success');
        console.log('✅ Producto actualizado:', this.productId);
      } else {
        await this.productService.addProduct(data);
        await this.showToast('✅ Producto creado correctamente', 'success');
        console.log('✅ Producto creado');
      }

      // Navegar después de un pequeño delay
      setTimeout(() => {
        this.router.navigate(['/admin/products']);
      }, 800);

    } catch (error) {
      console.error('❌ Error guardando producto:', error);
      await this.showToast('Error al guardar el producto', 'danger');
      this.isSaving = false;
      this.formSubmitted = false;
    }
  }

  /**
   * Navega atrás
   */
  goBack() {
    this.router.navigate(['/admin/products']);
  }

  /**
   * Obtiene las categorías disponibles
   */
  getCategories(): Category[] {
    return this.categoryService.categories();
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