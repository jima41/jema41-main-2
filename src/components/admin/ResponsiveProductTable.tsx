import React from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import MobileProductCard, { MobileStockItem } from './MobileProductCard';
import { StockItem } from './ProductTable';

interface ResponsiveProductTableProps {
  items: StockItem[];
  desktopComponent: React.ReactNode;
  onEdit?: (item: StockItem) => void;
  onDelete?: (id: string) => void;
}

const ResponsiveProductTable: React.FC<ResponsiveProductTableProps> = ({
  items,
  desktopComponent,
  onEdit,
  onDelete,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    const mobileItems: MobileStockItem[] = items.map((item) => ({
      id: item.id,
      name: item.name,
      brand: item.brand,
      price: item.price,
      currentStock: item.currentStock,
      weeklyVelocity: item.weeklyVelocity,
      lastUpdated: item.lastUpdated,
    }));

    return (
      <div className="space-y-2">
        {mobileItems.map((item) => (
          <MobileProductCard
            key={item.id}
            item={item}
            onEdit={(mobileItem) =>
              onEdit?.(items.find((i) => i.id === mobileItem.id) || ({} as StockItem))
            }
            onDelete={onDelete}
          />
        ))}
      </div>
    );
  }

  return <>{desktopComponent}</>;
};

export default ResponsiveProductTable;
