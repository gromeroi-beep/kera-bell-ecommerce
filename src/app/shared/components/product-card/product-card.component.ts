import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Product } from 'src/app/core/models/product.model';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-product-card',
  standalone: true,
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  imports: [
    IonicModule,
    CommonModule,
    CurrencyPipe
  ]
})
export class ProductCardComponent {

  // Propiedad de entrada: el producto a mostrar
  @Input() product!: Product;
  
  // Evento de salida: emite el ID del producto cuando se presiona "Detalle/Añadir"
  @Output() productSelected = new EventEmitter<string>(); 

  constructor(private router: Router) {}

  viewProductDetail() {
    if (this.product.id) {
      // Navega a la ruta de detalle del producto
      this.router.navigate(['/product-detail', this.product.id]);
    }
  }
}