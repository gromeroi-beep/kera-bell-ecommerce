export interface User {
  uid?: string;
  email: string;
  displayName?: string;
  name?: string;
  role?: 'admin' | 'client';
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}