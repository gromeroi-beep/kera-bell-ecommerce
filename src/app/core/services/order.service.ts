// src/app/core/services/order.service.ts

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
  where,
  Unsubscribe
} from 'firebase/firestore';
import { Order, OrderItem } from '../models/product.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService implements OnDestroy {

  private _orders = signal<Order[]>([]);
  public orders = this._orders;

  private _orders$ = new BehaviorSubject<Order[]>([]);
  public orders$(): Observable<Order[]> {
    return this._orders$.asObservable();
  }

  private _loading = signal<boolean>(true);
  public loading = computed(() => this._loading());

  private unsubscribe: Unsubscribe | null = null;
  private listenerActive = false;

  constructor(private firebase: FirebaseService) {
    console.log('[OK] OrderService inicializado');
  }

  ngOnDestroy() {
    this.stopListener();
  }

  /**
   * Inicializa el listener para TODAS las órdenes (Admin)
   */
  public initAllOrdersListener() {
    if (this.listenerActive) {
      console.warn('[WARN] Listener de ordenes ya esta activo');
      return;
    }

    this.listenerActive = true;
    this._loading.set(true);

    try {
      const db = this.firebase.db;
      const ref = collection(db, 'orders');
      const q = query(ref, orderBy('createdAt', 'desc'));

      this.unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log('[OK] Listener de ordenes disparado - Documentos encontrados:', snapshot.size);
          
          const list: Order[] = [];

          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as any;

            list.push({
              id: docSnap.id,
              userId: data.userId || '',
              orderNumber: data.orderNumber || '',
              items: data.items || [],
              shippingAddress: data.shippingAddress || '',
              totalAmount: Number(data.totalAmount ?? 0),
              paymentMethod: data.paymentMethod || '',
              status: data.status || 'Pending',
              createdAt: data.createdAt 
                ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt))
                : new Date()
            });
          });

          this._orders.set(list);
          this._orders$.next(list);
          this._loading.set(false);

          console.log('[OK] Ordenes cargadas exitosamente:', list.length);
        },
        (error: any) => {
          console.error('[ERROR] Error en listener de ordenes:', error.message);
          this._loading.set(false);
          this.listenerActive = false;
        }
      );
    } catch (error: any) {
      console.error('[ERROR] Error inicializando listener de ordenes:', error.message);
      this._loading.set(false);
      this.listenerActive = false;
    }
  }

  /**
   * Inicializa el listener para órdenes del usuario actual
   */
  public initUserOrdersListener(userId: string) {
    if (this.listenerActive) {
      console.warn('[WARN] Listener de ordenes de usuario ya esta activo');
      return;
    }

    this.listenerActive = true;
    this._loading.set(true);

    try {
      const db = this.firebase.db;
      const ref = collection(db, 'orders');
      const q = query(
        ref,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      this.unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log('[OK] Listener de ordenes del usuario disparado:', snapshot.size);
          
          const list: Order[] = [];

          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as any;

            list.push({
              id: docSnap.id,
              userId: data.userId || '',
              orderNumber: data.orderNumber || '',
              items: data.items || [],
              shippingAddress: data.shippingAddress || '',
              totalAmount: Number(data.totalAmount ?? 0),
              paymentMethod: data.paymentMethod || '',
              status: data.status || 'Pending',
              createdAt: data.createdAt 
                ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt))
                : new Date()
            });
          });

          this._orders.set(list);
          this._orders$.next(list);
          this._loading.set(false);

          console.log('[OK] Ordenes del usuario cargadas:', list.length);
        },
        (error: any) => {
          console.error('[ERROR] Error en listener de ordenes del usuario:', error.message);
          this._loading.set(false);
          this.listenerActive = false;
        }
      );
    } catch (error: any) {
      console.error('[ERROR] Error inicializando listener de ordenes:', error.message);
      this._loading.set(false);
      this.listenerActive = false;
    }
  }

  /**
   * Detiene el listener
   */
  private stopListener() {
    if (this.unsubscribe) {
      console.log('[OK] Deteniendo listener de ordenes');
      this.unsubscribe();
      this.unsubscribe = null;
      this.listenerActive = false;
    }
  }

  /**
   * Reinicia el listener
   */
  public restartListener() {
    console.log('[OK] Reiniciando listener de ordenes');
    this.stopListener();
    this.initAllOrdersListener();
  }

  /**
   * Obtener orden por ID
   */
  async getById(id: string): Promise<Order | null> {
    try {
      const ref = doc(this.firebase.db, 'orders', id);
      const snap = await getDoc(ref);
      if (!snap.exists()) return null;
      return {
        id: snap.id,
        ...(snap.data() as any)
      } as Order;
    } catch (error) {
      console.error('[ERROR] Error obteniendo orden:', error);
      return null;
    }
  }

  /**
   * Crear nueva orden (al hacer checkout)
   */
  async createOrder(order: Order): Promise<string> {
    try {
      const db = this.firebase.db;
      const ref = collection(db, 'orders');

      const orderNumber = `ORD-${Date.now()}`;

      const payload = {
        ...order,
        orderNumber: orderNumber,
        createdAt: new Date(),
        status: 'Pending'
      };

      const docRef = await addDoc(ref, payload as any);
      console.log('[OK] Orden creada:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('[ERROR] Error creando orden:', error);
      throw error;
    }
  }

  /**
   * Actualizar estado de una orden (Admin)
   */
  async updateOrderStatus(id: string, status: 'Pending' | 'Shipped' | 'Delivered'): Promise<void> {
    try {
      const db = this.firebase.db;
      const ref = doc(db, 'orders', id);
      await updateDoc(ref, {
        status: status,
        updatedAt: new Date()
      } as any);
      console.log('[OK] Estado de orden actualizado:', id);
    } catch (error) {
      console.error('[ERROR] Error actualizando orden:', error);
      throw error;
    }
  }

  /**
   * Cancelar una orden
   */
  async cancelOrder(id: string): Promise<void> {
    try {
      await this.updateOrderStatus(id, 'Pending');
      console.log('[OK] Orden cancelada:', id);
    } catch (error) {
      console.error('[ERROR] Error cancelando orden:', error);
      throw error;
    }
  }

  /**
   * Eliminar una orden (usar con cuidado - idealmente solo admins)
   */
  async deleteOrder(id: string): Promise<void> {
    try {
      const ref = doc(this.firebase.db, 'orders', id);
      await deleteDoc(ref);
      console.log('[OK] Orden eliminada:', id);
    } catch (error) {
      console.error('[ERROR] Error eliminando orden:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las órdenes en memoria
   */
  getAllOrders(): Order[] {
    return this._orders();
  }

  /**
   * Obtener órdenes del usuario actual
   */
  getUserOrders(userId: string): Order[] {
    return this._orders().filter(order => order.userId === userId);
  }

  /**
   * Obtener estadísticas (útil para dashboard admin)
   */
  getOrderStats() {
    const orders = this._orders();
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'Pending').length,
      shipped: orders.filter(o => o.status === 'Shipped').length,
      delivered: orders.filter(o => o.status === 'Delivered').length,
      totalRevenue: orders.reduce((acc, o) => acc + o.totalAmount, 0)
    };
  }
}