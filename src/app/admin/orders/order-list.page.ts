// src/app/admin/order/order-list/order-list.page.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { OrderService } from 'src/app/core/services/order.service';
import { Order } from 'src/app/core/models/product.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.page.html',
  styleUrls: ['./order-list.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class AdminOrderListPage implements OnInit, OnDestroy {

  orders: Order[] = [];
  filteredOrders: Order[] = [];
  isLoading = false;
  isDeleting = false;
  selectedStatus = 'all';

  private destroy$ = new Subject<void>();

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.loadOrders();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Cargar todas las órdenes
   */
  loadOrders() {
    this.isLoading = true;
    this.orderService.initAllOrdersListener();

    this.orderService.orders$()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (orders) => {
          this.orders = orders;
          this.filterOrders();
          this.isLoading = false;
          console.log('[OK] Ordenes cargadas:', orders.length);
        },
        error: (error) => {
          console.error('[ERROR] Error cargando ordenes:', error);
          this.isLoading = false;
        }
      });
  }

  /**
   * Filtrar órdenes por estado
   */
  filterOrders() {
    if (this.selectedStatus === 'all') {
      this.filteredOrders = this.orders;
    } else {
      this.filteredOrders = this.orders.filter(o => o.status === this.selectedStatus);
    }
  }

  /**
   * Cambiar filtro
   */
  onStatusChange(event: any) {
    this.selectedStatus = event.detail.value;
    this.filterOrders();
  }

  /**
   * Actualizar estado de una orden
   */
  async updateOrderStatus(orderId: string | undefined, newStatus: string) {
    if (!orderId) {
      console.error('❌ Order ID no válido');
      return;
    }

    try {
      // Validar que el estado sea uno de los permitidos
      const validStatuses = ['Pending', 'Shipped', 'Delivered'];
      if (!validStatuses.includes(newStatus)) {
        console.error('❌ Estado no válido:', newStatus);
        return;
      }

      console.log('Actualizando orden:', orderId, 'a estado:', newStatus);
      await this.orderService.updateOrderStatus(
        orderId,
        newStatus as 'Pending' | 'Shipped' | 'Delivered'
      );
      console.log('[OK] Estado actualizado exitosamente');
    } catch (error) {
      console.error('[ERROR] Error actualizando orden:', error);
    }
  }

  /**
   * Eliminar orden
   */
  async deleteOrder(orderId: string | undefined, orderNumber: string | undefined) {
    if (!orderId) {
      console.error('[ERROR] Order ID no valido');
      return;
    }

    const confirmed = window.confirm(
      `Estas seguro de que deseas eliminar la orden ${orderNumber}?`
    );

    if (!confirmed) {
      return;
    }

    this.isDeleting = true;
    try {
      console.log('Eliminando orden:', orderId);
      await this.orderService.deleteOrder(orderId);
      console.log('[OK] Orden eliminada exitosamente');
    } catch (error) {
      console.error('[ERROR] Error eliminando orden:', error);
    } finally {
      this.isDeleting = false;
    }
  }

  /**
   * Obtener estadísticas
   */
  getStats() {
    return this.orderService.getOrderStats();
  }

  /**
   * Formatos auxiliares para UI
   */
  getStatusBadge(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Pending': 'warning',
      'Shipped': 'primary',
      'Delivered': 'success'
    };
    return statusMap[status] || 'medium';
  }

  /**
   * Traducir estado al español
   */
  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'Pending': 'Pendiente',
      'Shipped': 'Enviada',
      'Delivered': 'Entregada'
    };
    return labels[status] || status;
  }

  /**
   * Track by para *ngFor
   */
  trackByOrderId(index: number, order: Order): string {
    return order.id || index.toString();
  }
}