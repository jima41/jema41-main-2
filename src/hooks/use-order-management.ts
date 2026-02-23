import { useState, useCallback } from 'react';
import { Order, UnboxingPersonalization } from '@/components/admin/OrderList';

const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    orderNumber: 'CMD-001847',
    clientName: 'Sophie Martin',
    clientEmail: 'sophie.martin@email.com',
    status: 'confirmed',
    items: [
      { productId: '1', productName: 'Éclat Doré 50ml', quantity: 1, price: 129.00 },
      { productId: '2', productName: 'Rose Éternelle 30ml', quantity: 1, price: 89.00 },
    ],
    totalAmount: 218.00,
    createdAt: new Date('2026-02-05'),
    unboxing: {
      giftWrap: 'luxury',
      personalCard: true,
      scentNotesInsert: true,
      premiumInsert: true,
      fragileProtection: true,
      giftMessage: 'Pour ma mère chérie, bon anniversaire! Avec tout mon amour. 💕',
    },
  },
  {
    id: '2',
    orderNumber: 'CMD-001846',
    clientName: 'Jean Dupont',
    clientEmail: 'jean.dupont@email.com',
    status: 'shipped',
    items: [
      { productId: '4', productName: 'Bois Noir 50ml', quantity: 1, price: 135.00 },
    ],
    totalAmount: 135.00,
    createdAt: new Date('2026-02-04'),
    shippedAt: new Date('2026-02-06'),
    unboxing: {
      giftWrap: 'classic',
      personalCard: false,
      scentNotesInsert: true,
      premiumInsert: false,
      fragileProtection: true,
    },
  },
  {
    id: '3',
    orderNumber: 'CMD-001845',
    clientName: 'Marie Leclerc',
    clientEmail: 'marie.leclerc@email.com',
    status: 'delivered',
    items: [
      { productId: '2', productName: 'Rose Éternelle 50ml', quantity: 2, price: 145.00 },
    ],
    totalAmount: 290.00,
    createdAt: new Date('2026-01-28'),
    shippedAt: new Date('2026-01-30'),
    deliveredAt: new Date('2026-02-02'),
    unboxing: {
      giftWrap: 'eco',
      personalCard: true,
      scentNotesInsert: true,
      premiumInsert: false,
      fragileProtection: true,
    },
  },
  {
    id: '4',
    orderNumber: 'CMD-001844',
    clientName: 'Pierre Moreau',
    clientEmail: 'pierre.moreau@email.com',
    status: 'pending',
    items: [
      { productId: '3', productName: 'Nuit Mystique 50ml', quantity: 1, price: 98.00 },
      { productId: '5', productName: 'Fleur de Lys 50ml', quantity: 1, price: 142.00 },
    ],
    totalAmount: 240.00,
    createdAt: new Date('2026-02-07'),
    unboxing: {
      giftWrap: 'luxury',
      personalCard: true,
      scentNotesInsert: true,
      premiumInsert: true,
      fragileProtection: true,
      giftMessage: 'À mon amie Alexandra - Profite de ce moment de détente! 🌸',
    },
  },
  {
    id: '5',
    orderNumber: 'CMD-001843',
    clientName: 'Amélie Bernard',
    clientEmail: 'amelie.bernard@email.com',
    status: 'pending',
    items: [
      { productId: '1', productName: 'Éclat Doré 50ml', quantity: 1, price: 129.00 },
    ],
    totalAmount: 116.10,
    createdAt: new Date('2026-02-06'),
    unboxing: {
      giftWrap: 'classic',
      personalCard: false,
      scentNotesInsert: true,
      premiumInsert: false,
      fragileProtection: true,
    },
    promoCode: 'BIENVENUE10',
    promoDiscount: 10,
  },
];

export const useOrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);

  const updateOrderStatus = useCallback(
    (orderId: string, newStatus: Order['status']) => {
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id === orderId) {
            const updatedOrder = { ...order, status: newStatus };
            if (newStatus === 'shipped' && !order.shippedAt) {
              updatedOrder.shippedAt = new Date();
            }
            if (newStatus === 'delivered' && !order.deliveredAt) {
              updatedOrder.deliveredAt = new Date();
            }
            return updatedOrder;
          }
          return order;
        })
      );
    },
    []
  );

  const updateUnboxing = useCallback(
    (orderId: string, unboxing: UnboxingPersonalization) => {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, unboxing } : order
        )
      );
    },
    []
  );

  const getOrderStats = useCallback(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === 'pending').length;
    const shipped = orders.filter((o) => o.status === 'shipped').length;
    const delivered = orders.filter((o) => o.status === 'delivered').length;
    const revenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return { total, pending, shipped, delivered, revenue };
  }, [orders]);

  return {
    orders,
    updateOrderStatus,
    updateUnboxing,
    getOrderStats,
  };
};
