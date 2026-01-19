export type Page = string;

export type Category = {
  id: number;
  name: string;
  slug: string;
  order: number;
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
  productId: string;
  name: string;
  price: number;
  qty: number;
};

export type Order = {
  id: string;
  name: string;
  comment: string;
  status: OrderStatus;
  createdAt: number;
  lines: Record<string, CartLine>;
  isPaid: boolean;
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
