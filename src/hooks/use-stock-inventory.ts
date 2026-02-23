import { useAdminStore } from '@/store/useAdminStore';
import { StockItem } from '@/components/admin/ProductTable';

export const useStockInventory = () => {
  const store = useAdminStore();
  const products = store.products;

  // Convert products to stock items format
  const stockItems: StockItem[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    price: product.price,
    currentStock: product.stock,
    weeklyVelocity: (product.monthlySales / 4.3), // Convert monthly to weekly (4.3 weeks per month)
    category: product.category,
    lastUpdated: new Date(),
  }));

  const updateStockLevel = (id: string, newStock: number) => {
    store.updateProductStock(id, newStock);
  };

  const updateVelocity = (id: string, newWeeklyVelocity: number) => {
    // Convert weekly velocity back to monthly sales
    const newMonthlySales = newWeeklyVelocity * 4.3;
    store.updateProductVelocity(id, newMonthlySales);
  };

  const deleteProduct = (id: string) => {
    store.deleteProduct(id);
  };

  return {
    stockItems,
    updateStockLevel,
    updateVelocity,
    deleteProduct,
  };
};
