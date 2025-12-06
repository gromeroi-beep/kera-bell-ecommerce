export interface Order {
  id?: string;
  orderNumber: string;
  userEmail: string;
  totalAmount: number;
  status: 'pendiente' | 'entregada' | 'cancelada';
  items: OrderItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}