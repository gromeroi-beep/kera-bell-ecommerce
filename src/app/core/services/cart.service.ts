// src/app/core/services/cart.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem } from '../models/product.model';
import { Storage } from '@ionic/storage-angular'; // Necesitas instalar: npm install @ionic/storage-angular

// Clave para guardar en el storage
const CART_STORAGE_KEY = 'kerabell_cart';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  
  // BehaviourSubject: Contiene la lista actual de ítems y la emite a los suscriptores.
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  public items$: Observable<CartItem[]> = this.itemsSubject.asObservable();

  // BehaviourSubject: Contiene el precio total y lo emite
  private totalSubject = new BehaviorSubject<number>(0);
  public total$: Observable<number> = this.totalSubject.asObservable();

  constructor(private storage: Storage) {
    // Inicializa el storage cuando se crea el servicio
    this.initStorage();
  }

  // Inicializa y carga los datos del carrito del Storage
  private async initStorage() {
    await this.storage.create();
    const storedItems = await this.storage.get(CART_STORAGE_KEY);
    if (storedItems) {
      this.itemsSubject.next(storedItems);
      this.calculateTotals();
    }
  }

  // --- Lógica del Carrito ---

  public getItems(): CartItem[] {
    return this.itemsSubject.getValue();
  }

  // Añadir/Actualizar Ítem al Carrito
  public addItem(item: CartItem): void {
    const currentItems = this.getItems();
    const existingItemIndex = currentItems.findIndex(i => i.product.id === item.product.id);

    if (existingItemIndex > -1) {
      // Si el producto existe, actualiza la cantidad
      currentItems[existingItemIndex].quantity += item.quantity;
    } else {
      // Si es un producto nuevo, añádelo
      currentItems.push(item);
    }
    
    this.updateCart(currentItems);
  }

  // Actualizar Cantidad (usado en la vista del carrito)
  public updateQuantity(productId: string, quantity: number): void {
    const currentItems = this.getItems();
    const item = currentItems.find(i => i.product.id === productId);

    if (item) {
        item.quantity = quantity;
        this.updateCart(currentItems);
    }
  }

  // Eliminar Ítem del Carrito
  public removeItem(productId: string): void {
    let currentItems = this.getItems();
    currentItems = currentItems.filter(i => i.product.id !== productId);
    this.updateCart(currentItems);
  }

  // Vacia el carrito después de una compra
  public clearCart(): void {
    this.updateCart([]);
  }

  // --- Lógica de Totales y Persistencia ---
  
  // Método central para guardar y notificar cambios
  private updateCart(items: CartItem[]): void {
    this.itemsSubject.next(items);
    this.storage.set(CART_STORAGE_KEY, items);
    this.calculateTotals();
  }

  // Cálculo de Totales (RF-C3: Se tiene que ir visualizando el precio total)
  private calculateTotals(): void {
    const items = this.getItems();
    const total = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    this.totalSubject.next(total);
  }
}