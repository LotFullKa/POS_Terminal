export type Page = string;

export type Category = {
  id: number;
  name: string;
  slug: string;
  order: number;
  is_addon?: boolean;
};

export type OrderStatus = "NEW" | "HANDOFF";

export type Product = {
  id: number | string;
  name: string;
  price: number;
  category_id?: number;
  is_active?: boolean;
  page?: string;
};

export type CartLine = {
  lineId: string;
  productId: string;
  name: string;
  price: number;
  qty: number;
  categoryId?: number;
  isAddon?: boolean;
};

export type Order = {
  id: string;
  name: string;
  comment: string;
  status: OrderStatus;
  createdAt: number;
  lines: Record<string, CartLine>;
  isPaid: boolean;
  lineOrder: string[];
};

export type OrderLine = {
  product_id: string;
  name: string;
  price: number;
  qty: number;
};

export type OrderDetail = {
  id: number;
  order_id: string;
  name: string;
  comment: string;
  status: string;
  total: number;
  is_paid: boolean;
  created_at: string;
  lines: OrderLine[];
};

export type DailyOrdersResponse = {
  date: string;
  total_revenue: number;
  total_orders: number;
  orders: OrderDetail[];
};
