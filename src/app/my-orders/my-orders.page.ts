// src/app/my-orders/my-orders.page.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { OrderService } from 'src/app/core/services/order.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Order } from 'src/app/core/models/product.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.page.html',
  styleUrls: ['./my-orders.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class MyOrdersPage implements OnInit, OnDestroy {

  userOrders: Order[] = [];
  isLoading = false;
  userId: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUserOrders();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserOrders() {
    const currentUser = (this.authService as any).currentUser;
    if (!currentUser) {
      console.error('[ERROR] Usuario no autenticado');
      return;
    }

    this.userId = currentUser.uid;
    this.isLoading = true;

    this.orderService.initUserOrdersListener(this.userId);

    this.orderService.orders$()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (orders) => {
          this.userOrders = orders;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('[ERROR] Error cargando ordenes:', error);
          this.isLoading = false;
        }
      });
  }

  getStatusBadge(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Pending': 'warning',
      'Shipped': 'primary',
      'Delivered': 'success'
    };
    return statusMap[status] || 'medium';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'Pending': 'Pendiente',
      'Shipped': 'Enviada',
      'Delivered': 'Entregada'
    };
    return labels[status] || status;
  }

  toggleOrderDetails(orderId: string | undefined) {
    if (!orderId) return;
    
    const orderCard = document.getElementById(`order-${orderId}`);
    if (orderCard) {
      orderCard.classList.toggle('expanded');
    }
  }

  trackByOrderId(index: number, order: Order): string {
    return order.id || index.toString();
  }
}