// src/app/products/product-list/product-list.page.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ProductService } from 'src/app/core/services/product-service';
import { Product } from 'src/app/core/models/product.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.page.html',
  styleUrls: ['./product-list.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ProductListPage implements OnInit, OnDestroy {

  products: Product[] = [];
  filteredProducts: Product[] = [];
  isLoading = false;
  selectedCategory = 'Todos';
  categories: string[] = [];
  searchTerm = '';

  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProducts() {
    this.isLoading = true;
    
    this.productService.products$()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products) => {
          this.products = products;
          this.categories = this.productService.categories();
          this.filterProducts();
          this.isLoading = false;
          console.log('[OK] Productos cargados:', products.length);
        },
        error: (error) => {
          console.error('[ERROR] Error cargando productos:', error);
          this.isLoading = false;
        }
      });
  }

  filterProducts() {
    let filtered = this.products;

    // Filtrar por categoría
    if (this.selectedCategory !== 'Todos') {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }

    // Filtrar por búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );
    }

    this.filteredProducts = filtered;
  }

  onCategoryChange(event: any) {
    this.selectedCategory = event.detail.value;
    this.filterProducts();
  }

  onSearch(event: any) {
    this.searchTerm = event.detail.value;
    this.filterProducts();
  }

  viewProduct(productId: string | undefined) {
    if (productId) {
      this.router.navigate(['/products', productId]);
    }
  }

  trackByProductId(index: number, product: Product): string {
    return product.id || index.toString();
  }
}