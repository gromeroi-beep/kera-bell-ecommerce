import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCardContent,
  IonButton,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonCardContent,
    IonButton,
  ],
  templateUrl: './order-confirmation.page.html',
  styleUrls: ['./order-confirmation.page.scss'],
})
export class OrderConfirmationPage {
  // Genera un número de referencia único para cada orden
  referenceNumber: string = this.generateReferenceNumber();

  constructor() {}

  /**
   * Genera un número de referencia único
   * Formato: KERA-XXXXXXXXX (timestamp)
   */
  generateReferenceNumber(): string {
    const timestamp = Date.now().toString().slice(-6);
    return `KERA-${timestamp}`;
  }
}