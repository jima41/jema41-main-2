import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { DEFAULT_PRODUCTS, type Product } from '@/lib/products';
import { useAdminStore, type Product as AdminProduct } from '@/store/useAdminStore';
import { useSyncAdminStore } from '@/hooks/use-sync-admin-store';

export type { Product };
export type { AdminProduct };

export interface PageView {
  path: string;
  timestamp: number;
  count: number;
}

interface AdminContextType {
  products: AdminProduct[];
  pageViews: PageView[];
  addProduct: (product: Omit<AdminProduct, 'id'>) => void;
  updateProduct: (id: string, product: Omit<AdminProduct, 'id'>) => void;
  deleteProduct: (id: string) => void;
  trackPageView: (path: string) => void;
  getPageStats: () => PageView[];
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const getInitialPageViews = (): PageView[] => {
  const saved = localStorage.getItem('admin_pageViews');
  return saved ? JSON.parse(saved) : [];
};

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  // Initialiser la synchronisation cross-device/cross-tab
  useSyncAdminStore();
  
  // Utiliser useAdminStore pour les produits (source unique de vérité)
  const storeProducts = useAdminStore((state) => state.products);
  const storeAddProduct = useAdminStore((state) => state.addProduct);
  const storeUpdateProduct = useAdminStore((state) => state.updateProduct);
  const storeDeleteProduct = useAdminStore((state) => state.deleteProduct);

  // État local pour les page views
  const [pageViews, setPageViews] = useState<PageView[]>(getInitialPageViews());

  // Synchroniser les page views avec localStorage
  useEffect(() => {
    localStorage.setItem('admin_pageViews', JSON.stringify(pageViews));
  }, [pageViews]);

  const addProduct = (product: Omit<AdminProduct, 'id'>) => {
    const newProduct: AdminProduct = {
      ...product,
      id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    storeAddProduct(newProduct);
  };

  const updateProduct = (id: string, updatedProduct: Omit<AdminProduct, 'id'>) => {
    storeUpdateProduct(id, updatedProduct);
  };

  const deleteProduct = (id: string) => {
    storeDeleteProduct(id);
  };

  const trackPageView = (path: string) => {
    setPageViews(prevViews => {
      const existing = prevViews.find(v => v.path === path);
      if (existing) {
        return prevViews.map(v => 
          v.path === path 
            ? { ...v, timestamp: Date.now() }
            : v
        );
      }
      return [...prevViews, { path, timestamp: Date.now(), count: 1 }];
    });
  };

  const getPageStats = () => {
    return [...pageViews].sort((a, b) => b.timestamp - a.timestamp);
  };

  return (
    <AdminContext.Provider value={{ products: storeProducts, pageViews, addProduct, updateProduct, deleteProduct, trackPageView, getPageStats }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
