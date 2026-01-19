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
