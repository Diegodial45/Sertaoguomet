
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'entradas' | 'pratos' | 'sobremesas' | 'bebidas';
  image: string;
  stock: number;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export type PaymentMethod = 'dinheiro' | 'pix' | 'cartão';

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  customerName: string;
  tableNumber: string;
  timestamp: number;
  paymentMethod?: PaymentMethod;
  type: 'table' | 'quick';
}

export interface User {
  id: string;
  login: string;
  password: string;
  role: 'admin' | 'atendente' | 'cozinha';
}

export interface CashierSession {
  id: string;
  openedAt: number;
  closedAt?: number;
  initialBalance: number;
  finalBalance?: number;
  sales: {
    dinheiro: number;
    pix: number;
    cartão: number;
  };
  isOpen: boolean;
}

export interface FooterConfig {
  brandName: string;
  description: string;
  hoursWeek: string;
  hoursWeekend: string;
  phone: string;
  email: string;
  address: string;
  copyright: string;
}

export type AdminTab = 'orders' | 'users' | 'settings';

export type ViewState = 'menu' | 'admin' | 'cart' | 'home' | 'quick-sell' | 'stock' | 'caixa' | 'login';
