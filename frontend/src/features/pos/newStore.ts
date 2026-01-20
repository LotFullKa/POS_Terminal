import { create } from "zustand";
import type { Order, OrderStatus, Page, Product, Category } from "./types";
import { api } from "./api";
import { generateFunnyOrderName } from "./orderNameGenerator";

const uid = () => Math.random().toString(36).slice(2, 9);

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
  moveToQueueAndCreateNew: () => string;

  addToCurrent: (p: Product) => void;
  incLine: (productId: number) => void;
  decLine: (productId: number) => void;
  clearCurrent: () => void;
  cancelOrder: (id: string) => void;

  products: Product[];
  categories: Category[];

  loadCategories: () => Promise<void>;
  loadProducts: (categoryId?: number) => Promise<void>;

  addProduct: (product: Omit<Product, "id" | "is_active">) => Promise<void>;
  updateProduct: (id: number | string, product: Partial<Omit<Product, "id">>) => Promise<void>;
  deleteProduct: (id: number | string) => Promise<void>;

  addCategory: (name: string, slug: string) => Promise<void>;
  updateCategory: (id: number, name: string) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
};

export const usePosStore = create<State>()((set, get) => ({
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
      name: generateFunnyOrderName(),
      comment: "",
      status: "NEW",
      createdAt: Date.now(),
      lines: {},
      isPaid: false,
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
          name: generateFunnyOrderName(),
          comment: "",
          status: "NEW",
          createdAt: Date.now(),
          lines: {},
          isPaid: false,
        } as Order);

      const productKey = String(p.id);
      const line = order.lines[productKey];
      const lines = {
        ...order.lines,
        [productKey]: line
          ? { ...line, qty: line.qty + 1 }
          : { productId: productKey, name: p.name, price: p.price, qty: 1 },
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
      const productKey = String(productId);
      const line = o?.lines[productKey];
      if (!o || !line) return s;
      return {
        orders: {
          ...s.orders,
          [o.id]: {
            ...o,
            lines: { ...o.lines, [productKey]: { ...line, qty: line.qty + 1 } },
          },
        },
      };
    }),

  decLine: (productId) =>
    set((s) => {
      if (!s.currentOrderId) return s;
      const o = s.orders[s.currentOrderId];
      const productKey = String(productId);
      const line = o?.lines[productKey];
      if (!o || !line) return s;

      const lines = { ...o.lines };
      if (line.qty <= 1) delete lines[productKey];
      else lines[productKey] = { ...line, qty: line.qty - 1 };

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
      orders: {
        ...s.orders,
        [id]: { ...s.orders[id], isPaid: !s.orders[id].isPaid },
      },
    })),

  moveToQueueAndCreateNew: () => {
    // Заказ уже в статусе NEW (очередь), просто создаем новый заказ
    return get().newOrder();
  },

  cancelOrder: (id) =>
    set((s) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [id]: _, ...remainingOrders } = s.orders;
      return {
        orders: remainingOrders,
        currentOrderId: s.currentOrderId === id ? null : s.currentOrderId,
      };
    }),

  products: [],
  categories: [],

  loadCategories: async () => {
    try {
      const { categories } = await api.getCategories();
      set({ categories });
      if (categories.length > 0 && !get().page) {
        set({ page: categories[0].slug });
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  },

  loadProducts: async (categoryId?: number) => {
    try {
      const { products } = await api.getProducts(categoryId);
      set({ products });
    } catch (error) {
      console.error("Failed to load products:", error);
    }
  },

  addProduct: async (product) => {
    try {
      const newProduct = await api.createProduct({
        name: product.name,
        price: product.price,
        category_id: product.category_id ?? 0,
      });
      set((s) => ({ products: [...s.products, newProduct] }));
    } catch (error) {
      console.error("Failed to add product:", error);
      throw error;
    }
  },

  updateProduct: async (id, updates) => {
    try {
      const updated = await api.updateProduct(id, updates);
      set((s) => ({
        products: s.products.map((p) => (p.id === id ? updated : p)),
      }));
    } catch (error) {
      console.error("Failed to update product:", error);
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      await api.deleteProduct(id);
      set((s) => ({
        products: s.products.filter((p) => p.id !== id),
      }));
    } catch (error) {
      console.error("Failed to delete product:", error);
      throw error;
    }
  },

  addCategory: async (name, slug) => {
    try {
      const newCategory = await api.createCategory(name, slug);
      set((s) => ({
        categories: [...s.categories, newCategory],
        page: newCategory.slug,
      }));
    } catch (error) {
      console.error("Failed to add category:", error);
      throw error;
    }
  },

  updateCategory: async (id, name) => {
    try {
      const updated = await api.updateCategory(id, { name });
      set((s) => ({
        categories: s.categories.map((c) => (c.id === id ? updated : c)),
      }));
    } catch (error) {
      console.error("Failed to update category:", error);
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      await api.deleteCategory(id);
      set((s) => {
        const newCategories = s.categories.filter((c) => c.id !== id);
        return {
          categories: newCategories,
          products: s.products.filter((p) => p.category_id !== id),
          page:
            s.page === String(id)
              ? newCategories[0]?.slug ?? "drinks"
              : s.page,
        };
      });
    } catch (error) {
      console.error("Failed to delete category:", error);
      throw error;
    }
  },
}));
