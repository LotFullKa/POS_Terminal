import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Order, OrderStatus, Page, Product, Category } from "./types";

const uid = () => Math.random().toString(36).slice(2, 9);

const defaultCategories: Category[] = [
  { id: "drinks", label: "Напитки" },
  { id: "syrups", label: "Сиропы" },
  { id: "addons", label: "Добавки" },
  { id: "season", label: "Сезон" },
];

const defaultProducts: Product[] = [
  { id: "latte", name: "Латте", price: 250, page: "drinks" },
  { id: "cappuccino", name: "Капучино", price: 230, page: "drinks" },
  { id: "americano", name: "Американо", price: 180, page: "drinks" },
  { id: "tea", name: "Чай", price: 150, page: "drinks" },
  { id: "matcha", name: "Матча", price: 280, page: "drinks" },
  { id: "cocoa", name: "Какао", price: 200, page: "drinks" },
];

type State = {
  page: Page;
  setPage: (p: Page) => void;

  statusFilter: OrderStatus;
  setStatusFilter: (s: OrderStatus) => void;

  orders: Record<string, Order>;
  currentOrderId: string | null;

  ensureCurrent: () => string;
  newOrder: () => string;
  selectOrder: (id: string) => void;
  setOrderStatus: (id: string, status: OrderStatus) => void;
  setOrderName: (id: string, name: string) => void;
  setOrderComment: (id: string, comment: string) => void;
  toggleOrderPaid: (id: string) => void;

  addToCurrent: (p: Product) => void;
  incLine: (productId: string) => void;
  decLine: (productId: string) => void;
  clearCurrent: () => void;
  cancelOrder: (id: string) => void;

  products: Product[];
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, product: Partial<Omit<Product, "id">>) => void;
  deleteProduct: (id: string) => void;

  categories: Category[];
  addCategory: (label: string) => void;
  updateCategory: (id: string, label: string) => void;
  deleteCategory: (id: string) => void;
};

export const usePosStore = create<State>()(
  persist(
    (set, get) => ({
  page: "drinks",
  setPage: (p) => set({ page: p }),

  statusFilter: "NEW",
  setStatusFilter: (s) => set({ statusFilter: s }),

  orders: {},
  currentOrderId: null,

  ensureCurrent: () => {
    const s = get();
    if (s.currentOrderId && s.orders[s.currentOrderId]) return s.currentOrderId;
    return get().newOrder();
  },

  newOrder: () => {
    const id = uid();
    const order: Order = {
      id,
      name: `Заказ #${id}`,
      comment: "",
      status: "NEW",
      createdAt: Date.now(),
      lines: {},
      isPaid: false
    };
    set((s) => ({ orders: { ...s.orders, [id]: order }, currentOrderId: id }));
    return id;
  },

  selectOrder: (id) => set({ currentOrderId: id }),

  setOrderStatus: (id, status) =>
    set((s) => ({
      orders: { ...s.orders, [id]: { ...s.orders[id], status } },
    })),

  setOrderName: (id, name) =>
    set((s) => ({
      orders: { ...s.orders, [id]: { ...s.orders[id], name } },
    })),

  setOrderComment: (id, comment) =>
    set((s) => ({
      orders: { ...s.orders, [id]: { ...s.orders[id], comment } },
    })),

  addToCurrent: (p) =>
    set((s) => {
      const orderId = s.currentOrderId ?? uid();
      const order =
        s.orders[orderId] ??
        ({
          id: orderId,
          name: `Заказ #${orderId}`,
          comment: "",
          status: "NEW",
          createdAt: Date.now(),
          lines: {},
          isPaid: false
        } as Order);

      const line = order.lines[p.id];
      const lines = {
        ...order.lines,
        [p.id]: line
          ? { ...line, qty: line.qty + 1 }
          : { productId: p.id, name: p.name, price: p.price, qty: 1 },
      };

      return {
        currentOrderId: orderId,
        orders: { ...s.orders, [orderId]: { ...order, lines } },
      };
    }),

  incLine: (productId) =>
    set((s) => {
      if (!s.currentOrderId) return s;
      const o = s.orders[s.currentOrderId];
      const line = o?.lines[productId];
      if (!o || !line) return s;
      return {
        orders: {
          ...s.orders,
          [o.id]: { ...o, lines: { ...o.lines, [productId]: { ...line, qty: line.qty + 1 } } },
        },
      };
    }),

  decLine: (productId) =>
    set((s) => {
      if (!s.currentOrderId) return s;
      const o = s.orders[s.currentOrderId];
      const line = o?.lines[productId];
      if (!o || !line) return s;

      const lines = { ...o.lines };
      if (line.qty <= 1) delete lines[productId];
      else lines[productId] = { ...line, qty: line.qty - 1 };

      return { orders: { ...s.orders, [o.id]: { ...o, lines } } };
    }),

  clearCurrent: () =>
    set((s) => {
      if (!s.currentOrderId) return s;
      const o = s.orders[s.currentOrderId];
      if (!o) return s;
      return { orders: { ...s.orders, [o.id]: { ...o, lines: {} } } };
    }),

  toggleOrderPaid: (id) =>
    set((s) => ({
      orders: { ...s.orders, [id]: { ...s.orders[id], isPaid: !s.orders[id].isPaid } },
    })),

  cancelOrder: (id) =>
    set((s) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [id]: _, ...remainingOrders } = s.orders;
      return {
        orders: remainingOrders,
        currentOrderId: s.currentOrderId === id ? null : s.currentOrderId,
      };
    }),

  products: defaultProducts,

  addProduct: (product) =>
    set((s) => ({
      products: [...s.products, { ...product, id: uid() }],
    })),

  updateProduct: (id, updates) =>
    set((s) => ({
      products: s.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  deleteProduct: (id) =>
    set((s) => ({
      products: s.products.filter((p) => p.id !== id),
    })),

  categories: defaultCategories,

  addCategory: (label) =>
    set((s) => {
      const newCategory = { id: uid(), label };
      return {
        categories: [...s.categories, newCategory],
        page: newCategory.id,
      };
    }),

  updateCategory: (id, label) =>
    set((s) => ({
      categories: s.categories.map((c) => (c.id === id ? { ...c, label } : c)),
    })),

  deleteCategory: (id) =>
    set((s) => {
      const newCategories = s.categories.filter((c) => c.id !== id);
      return {
        categories: newCategories,
        products: s.products.filter((p) => p.page !== id),
        page: s.page === id ? (newCategories[0]?.id ?? "drinks") : s.page,
      };
    }),
}),
    {
      name: "pos-storage",
      partialize: (state) => ({
        products: state.products,
        categories: state.categories,
      }),
    }
  )
);
