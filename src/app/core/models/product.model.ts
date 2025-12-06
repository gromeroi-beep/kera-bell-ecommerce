// src/app/core/models/product.model.ts

// 1. Modelo Principal del Producto (Usado en CRUD Admin y Catálogo)
export interface Product {
  id?: string;             
  name: string;            
  description: string;     
  price: number;           
  stock: number;           
  imageUrl: string;
  category?: string;        // ✅ NUEVA: Categoría del producto
  createdAt: Date;         
  updatedAt?: Date;        
}

// 2. Modelo de Ítem en el Carrito (Usado en CartService y CartPage)
export interface CartItem {
  product: Product;
  quantity: number;
}

// 3. Modelo de Ítem en la Orden
export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;  // ✅ AGREGADO
}

// 4. Modelo de la Orden (Usado en Checkout y OrderService)
export interface Order {
  id?: string;
  userId: string;                   // El usuario que realizó la compra
  orderNumber?: string;             // ✅ AGREGADO: Número de orden único
  items: OrderItem[];               // ✅ MEJORADO: Usa la interfaz OrderItem
  shippingAddress: string;          // Dirección de envío
  totalAmount: number;              // Precio total
  paymentMethod: string;            // Método de pago
  status: 'Pending' | 'Shipped' | 'Delivered'; // Estado de la orden
  createdAt: Date;
  updatedAt?: Date;                 // ✅ AGREGADO: Para auditoría
}