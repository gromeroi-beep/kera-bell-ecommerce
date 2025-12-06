// src/app/core/services/product-service.ts

import { Injectable, signal, computed, OnDestroy } from '@angular/core';
import { FirebaseService } from './firebase-service';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  Unsubscribe
} from 'firebase/firestore';
import { Product } from '../models/product.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService implements OnDestroy {

  private _products = signal<Product[]>([]);
  public products = this._products;

  private _products$ = new BehaviorSubject<Product[]>([]);
  public products$(): Observable<Product[]> {
    return this._products$.asObservable();
  }

  private _loading = signal<boolean>(true);
  public loading = computed(() => this._loading());

  private unsubscribe: Unsubscribe | null = null;
  private listenerActive = false;

  constructor(private firebase: FirebaseService) {
    console.log('[OK] ProductService inicializado');
    this.initListener();
  }

  ngOnDestroy() {
    this.stopListener();
  }

  /**
   * Inicializa el listener SOLO UNA VEZ
   */
  private initListener() {
    if (this.listenerActive) {
      console.warn('[WARN] Listener de productos ya esta activo');
      return;
    }

    this.listenerActive = true;
    this._loading.set(true);

    try {
      const db = this.firebase.db;
      const ref = collection(db, 'products');
      const q = query(ref, orderBy('name', 'asc'));

      this.unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log('[OK] Listener disparado - Documentos encontrados:', snapshot.size);
          
          const list: Product[] = [];

          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as any;

            list.push({
              id: docSnap.id,
              name: data.name || '',
              description: data.description || '',
              price: Number(data.price ?? 0),
              stock: Number(data.stock ?? 0),
              imageUrl: data.imageUrl || data.image || '',
              category: data.category || '',
              createdAt: data.createdAt 
                ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt))
                : new Date(),
              updatedAt: data.updatedAt 
                ? (data.updatedAt.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt))
                : undefined
            });
          });

          // Actualizar signals y observables
          this._products.set(list);
          this._products$.next(list);
          this._loading.set(false);

          console.log('[OK] Productos cargados exitosamente:', list.length);
        },
        (error: any) => {
          console.error('[ERROR] Error en listener de productos:', error.message);
          this._loading.set(false);
          this.listenerActive = false;
        }
      );
    } catch (error: any) {
      console.error('[ERROR] Error inicializando listener de productos:', error.message);
      this._loading.set(false);
      this.listenerActive = false;
    }
  }

  /**
   * Detiene el listener
   */
  private stopListener() {
    if (this.unsubscribe) {
      console.log('[OK] Deteniendo listener de productos');
      this.unsubscribe();
      this.unsubscribe = null;
      this.listenerActive = false;
    }
  }

  /**
   * Reinicia el listener
   */
  public restartListener() {
    console.log('[OK] Reiniciando listener de productos');
    this.stopListener();
    this.initListener();
  }

  /**
   * Obtener producto por ID
   */
  async getById(id: string): Promise<Product | null> {
    try {
      const ref = doc(this.firebase.db, 'products', id);
      const snap = await getDoc(ref);
      if (!snap.exists()) return null;
      
      const data = snap.data() as any;
      return {
        id: snap.id,
        name: data.name || '',
        description: data.description || '',
        price: Number(data.price ?? 0),
        stock: Number(data.stock ?? 0),
        imageUrl: data.imageUrl || data.image || '',
        category: data.category || '',
        createdAt: data.createdAt 
          ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt))
          : new Date(),
        updatedAt: data.updatedAt 
          ? (data.updatedAt.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt))
          : undefined
      } as Product;
    } catch (error) {
      console.error('[ERROR] Error obteniendo producto:', error);
      return null;
    }
  }

  /**
   * Agregar nuevo producto
   */
  async addProduct(product: Product) {
    try {
      const db = this.firebase.db;
      const ref = collection(db, 'products');

      const payload = {
        ...product,
        createdAt: new Date()
      };

      const docRef = await addDoc(ref, payload as any);
      console.log('[OK] Producto agregado:', docRef.id);
      return docRef;
    } catch (error) {
      console.error('[ERROR] Error agregando producto:', error);
      throw error;
    }
  }

  /**
   * Actualizar producto
   */
  async updateProduct(id: string, product: Partial<Product>) {
    try {
      const db = this.firebase.db;
      const ref = doc(db, 'products', id);
      const payload = {
        ...product,
        updatedAt: new Date()
      };
      await updateDoc(ref, payload as any);
      console.log('[OK] Producto actualizado:', id);
    } catch (error) {
      console.error('[ERROR] Error actualizando producto:', error);
      throw error;
    }
  }

  /**
   * Eliminar producto
   */
  async deleteProduct(id: string): Promise<void> {
    try {
      const ref = doc(this.firebase.db, 'products', id);
      await deleteDoc(ref);
      console.log('[OK] Producto eliminado:', id);
    } catch (error) {
      console.error('[ERROR] Error eliminando producto:', error);
      throw error;
    }
  }

  /**
   * Obtener lista de categorias unicas
   */
  categories() {
    const set = new Set(
      this._products()
        .map((p: any) => p.category?.toString?.().trim())
        .filter((c: any) => !!c && c.toLowerCase() !== 'todos')  // Excluir "todos" case-insensitive
    );
    return ['Todos', ...Array.from(set)];
  }
}