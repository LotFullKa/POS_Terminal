export type Page = string;

export type Category = {
  id: string;
  label: string;
};

export type OrderStatus = "NEW" | "HANDOFF";

export type Product = {
  id: string;
  name: string;
  price: number;
  page: Page;
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
