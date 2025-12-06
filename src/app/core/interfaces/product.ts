export interface Product {
  id?: string;
  name: string;
  description?: string;
  price?: number;
  image?: string;

  // Pueden venir así desde Firestore:
  category?: string;

  // O como lista:
  categories?: string[];
}
