/**
 * Data Synchronization Service
 * Centralizes all data synchronization, validation, and cleanup
 * Ensures data consistency across all stores and contexts
 */

import { useAdminStore } from '@/store/useAdminStore';
import { useCartStore, CartItem } from '@/store/useCartStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import type { Product } from '@/store/useAdminStore';

export interface DataSyncReport {
  timestamp: number;
  orphanedFavorites: string[];
  orphanedCartItems: string[];
  orphanedFeaturedProducts: string[];
  removedItems: number;
  isValid: boolean;
  errors: string[];
}

export interface DataIntegrity {
  totalProducts: number;
  totalFeaturedProducts: number;
  totalFavorites: number;
  totalCartItems: number;
  isConsistent: boolean;
  issues: string[];
}

// ============================================================================
// SYNC SERVICE - CENTRALIZED DATA MANAGEMENT
// ============================================================================

class DataSyncService {
  private syncListeners: Set<(report: DataSyncReport) => void> = new Set();

  /**
   * Subscribe to sync events
   */
  subscribe(callback: (report: DataSyncReport) => void) {
    this.syncListeners.add(callback);
    return () => this.syncListeners.delete(callback);
  }

  /**
   * Notify all listeners of sync report
   */
  private notifyListeners(report: DataSyncReport) {
    this.syncListeners.forEach((listener) => listener(report));
  }

  /**
   * Get all valid product IDs from the store
   */
  private getValidProductIds(): Set<string> {
    const store = useAdminStore.getState();
    return new Set(store.products.map((p) => p.id));
  }

  /**
   * Validate and clean orphaned favorites
   */
  private validateFavorites(): { orphaned: string[]; cleaned: string[] } {
    const favoritesStore = useFavoritesStore.getState();
    const validIds = this.getValidProductIds();
    
    const orphaned = favoritesStore.favorites.filter((id) => !validIds.has(id));
    
    if (orphaned.length > 0) {
      const cleaned = favoritesStore.favorites.filter((id) => validIds.has(id));
      useFavoritesStore.setState({ favorites: cleaned });
    }
    
    return { orphaned, cleaned: orphaned };
  }

  /**
   * Validate and clean orphaned cart items
   */
  private validateCart(): { orphaned: string[]; cleaned: string[] } {
    const cartStore = useCartStore.getState();
    const validIds = this.getValidProductIds();
    
    const orphaned = cartStore.cartItems
      .filter((item) => !validIds.has(item.id))
      .map((item) => item.id);
    
    if (orphaned.length > 0) {
      const cleanedItems = cartStore.cartItems.filter((item) => validIds.has(item.id));
      
      // Recalculate totals
      const cartItemsCount = cleanedItems.reduce((sum, item) => sum + item.quantity, 0);
      const cartTotal = cleanedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      
      useCartStore.setState({
        cartItems: cleanedItems,
        cartItemsCount,
        cartTotal,
      });
    }
    
    return { orphaned, cleaned: orphaned };
  }

  /**
   * Validate and clean featured products
   */
  private validateFeaturedProducts(): { orphaned: string[]; cleaned: string[] } {
    const adminStore = useAdminStore.getState();
    const validIds = this.getValidProductIds();
    
    const orphaned = adminStore.featuredProductIds.filter(
      (id) => !validIds.has(id)
    );
    
    if (orphaned.length > 0) {
      const cleaned = adminStore.featuredProductIds.filter((id) => validIds.has(id));
      useAdminStore.setState({ featuredProductIds: cleaned });
    }
    
    return { orphaned, cleaned: orphaned };
  }

  /**
   * Main sync operation - clean all orphaned references
   */
  sync(): DataSyncReport {
    const report: DataSyncReport = {
      timestamp: Date.now(),
      orphanedFavorites: [],
      orphanedCartItems: [],
      orphanedFeaturedProducts: [],
      removedItems: 0,
      isValid: true,
      errors: [],
    };

    try {
      // Validate all sections
      const { orphaned: favoragesOrphaned } = this.validateFavorites();
      const { orphaned: cartOrphaned } = this.validateCart();
      const { orphaned: featuredOrphaned } = this.validateFeaturedProducts();

      report.orphanedFavorites = favoragesOrphaned;
      report.orphanedCartItems = cartOrphaned;
      report.orphanedFeaturedProducts = featuredOrphaned;
      report.removedItems = favoragesOrphaned.length + cartOrphaned.length + featuredOrphaned.length;
      report.isValid = report.removedItems === 0;

      // Log sync if cleanup needed
      if (report.removedItems > 0) {
        console.log('[DataSync] Cleanup performed:', report);
        this.saveSyncLog(report);
      }

      this.notifyListeners(report);
    } catch (error) {
      report.isValid = false;
      report.errors.push(error instanceof Error ? error.message : String(error));
      console.error('[DataSync] Error during sync:', error);
    }

    return report;
  }

  /**
   * Check data integrity across all stores
   */
  checkIntegrity(): DataIntegrity {
    const adminStore = useAdminStore.getState();
    const cartStore = useCartStore.getState();
    const favoritesStore = useFavoritesStore.getState();
    const validIds = this.getValidProductIds();

    const issues: string[] = [];

    // Check featured products references
    const invalidFeatured = adminStore.featuredProductIds.filter(
      (id) => !validIds.has(id)
    );
    if (invalidFeatured.length > 0) {
      issues.push(`${invalidFeatured.length} featured products with invalid IDs`);
    }

    // Check cart items references
    const invalidCart = cartStore.cartItems.filter((item) => !validIds.has(item.id));
    if (invalidCart.length > 0) {
      issues.push(`${invalidCart.length} cart items with invalid product IDs`);
    }

    // Check favorites references
    const invalidFavorites = favoritesStore.favorites.filter((id) => !validIds.has(id));
    if (invalidFavorites.length > 0) {
      issues.push(`${invalidFavorites.length} favorites with invalid product IDs`);
    }

    // Check for duplicate cart items
    const cartIds = cartStore.cartItems.map((item) => item.id);
    const duplicates = cartIds.filter((id, index) => cartIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
      issues.push(`Cart contains duplicate products: ${[...new Set(duplicates)].join(', ')}`);
    }

    return {
      totalProducts: adminStore.products.length,
      totalFeaturedProducts: adminStore.featuredProductIds.length,
      totalFavorites: favoritesStore.favorites.length,
      totalCartItems: cartStore.cartItems.length,
      isConsistent: issues.length === 0,
      issues,
    };
  }

  /**
   * Save sync log to localStorage for debugging
   */
  private saveSyncLog(report: DataSyncReport) {
    try {
      const logs: DataSyncReport[] = JSON.parse(
        localStorage.getItem('data-sync-logs') || '[]'
      );
      logs.push(report);
      // Keep last 50 logs
      if (logs.length > 50) {
        logs.shift();
      }
      localStorage.setItem('data-sync-logs', JSON.stringify(logs));
    } catch (error) {
      console.error('[DataSync] Failed to save log:', error);
    }
  }

  /**
   * Get sync logs for debugging
   */
  getSyncLogs(): DataSyncReport[] {
    try {
      return JSON.parse(localStorage.getItem('data-sync-logs') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Clear all sync logs
   */
  clearSyncLogs() {
    localStorage.removeItem('data-sync-logs');
  }

  /**
   * Export all data for backup
   */
  exportData() {
    const adminStore = useAdminStore.getState();
    const cartStore = useCartStore.getState();
    const favoritesStore = useFavoritesStore.getState();

    return {
      exportDate: new Date().toISOString(),
      version: '1.0',
      data: {
        products: adminStore.products,
        orders: adminStore.orders,
        featuredProductIds: adminStore.featuredProductIds,
        abandonedCarts: adminStore.abandonedCarts,
        cartItems: cartStore.cartItems,
        favorites: favoritesStore.favorites,
      },
      integrity: this.checkIntegrity(),
    };
  }

  /**
   * Import data from backup (with validation)
   */
  importData(backup: any) {
    try {
      if (!backup.data || !backup.version) {
        throw new Error('Invalid backup format');
      }

      // Validate data before importing
      if (!Array.isArray(backup.data.products)) {
        throw new Error('Invalid products data');
      }

      // Import products
      if (backup.data.products.length > 0) {
        useAdminStore.setState({ products: backup.data.products });
      }

      // Import featured products with validation
      const validIds = new Set(backup.data.products.map((p: Product) => p.id));
      const validFeatured = backup.data.featuredProductIds.filter((id: string) =>
        validIds.has(id)
      );
      if (validFeatured.length > 0) {
        useAdminStore.setState({ featuredProductIds: validFeatured });
      }

      // Import cart items with validation
      const validCart = backup.data.cartItems.filter((item: CartItem) =>
        validIds.has(item.id)
      );
      if (validCart.length > 0) {
        const cartItemsCount = validCart.reduce((sum, item) => sum + item.quantity, 0);
        const cartTotal = validCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        useCartStore.setState({
          cartItems: validCart,
          cartItemsCount,
          cartTotal,
        });
      }

      // Import favorites with validation
      const validFavorites = backup.data.favorites.filter((id: string) => validIds.has(id));
      if (validFavorites.length > 0) {
        useFavoritesStore.setState({ favorites: validFavorites });
      }

      // Import orders
      if (Array.isArray(backup.data.orders) && backup.data.orders.length > 0) {
        useAdminStore.setState({ orders: backup.data.orders });
      }

      // Import abandoned carts
      if (
        Array.isArray(backup.data.abandonedCarts) &&
        backup.data.abandonedCarts.length > 0
      ) {
        useAdminStore.setState({ abandonedCarts: backup.data.abandonedCarts });
      }

      return { success: true, message: 'Data imported successfully' };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[DataSync] Import failed:', message);
      return { success: false, message };
    }
  }

  /**
   * Reset all data to defaults
   */
  resetAllData() {
    useAdminStore.setState({
      products: useAdminStore.getState().resetProductsToDefaults,
      orders: [],
      featuredProductIds: [],
      abandonedCarts: [],
    });
    useCartStore.setState({
      cartItems: [],
      cartItemsCount: 0,
      cartTotal: 0,
    });
    useFavoritesStore.setState({ favorites: [] });
    localStorage.removeItem('data-sync-logs');
  }
}

// Export singleton instance
export const dataSyncService = new DataSyncService();

// Also export the class for testing
export default DataSyncService;
