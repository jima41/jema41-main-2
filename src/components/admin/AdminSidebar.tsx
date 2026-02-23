import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { BarChart3, Package, Users, ShoppingCart, ChevronRight, LineChart, Heart, Sparkles, TrendingDown, TicketPercent, Flower2, Brain } from 'lucide-react';

interface AdminSidebarProps {
  onItemClick?: () => void;
}

const AdminSidebar = ({ onItemClick }: AdminSidebarProps) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      label: 'Tableau de bord',
      icon: BarChart3,
      path: '/admin/dashboard',
      description: 'Vue d\'ensemble',
    },
    {
      label: 'Inventaire',
      icon: Package,
      path: '/admin/inventory',
      description: 'Gestion des produits',
    },
    {
      label: 'Notre Sélection',
      icon: Sparkles,
      path: '/admin/featured',
      description: 'Produits en vedette',
    },
    {
      label: 'Clients Scent-ID',
      icon: Users,
      path: '/admin/clients',
      description: 'Profils clients',
    },
    {
      label: 'Commandes',
      icon: ShoppingCart,
      path: '/admin/orders',
      description: 'Gestion des ventes',
    },
    {
      label: 'Analytics',
      icon: LineChart,
      path: '/admin/analytics',
      description: 'Profils olfactifs',
    },
    {
      label: 'CRM',
      icon: Heart,
      path: '/admin/crm',
      description: 'Récupération paniers',
    },
    {
      label: 'Insights Paniers',
      icon: TrendingDown,
      path: '/admin/abandoned-insights',
      description: 'Analyse prédictive',
    },
    {
      label: 'Notes Olfactives',
      icon: Flower2,
      path: '/admin/olfactory-notes',
      description: 'Bibliothèque de notes',
    },
    {
      label: 'Codes Promo',
      icon: TicketPercent,
      path: '/admin/promo-codes',
      description: 'Gestion des promos',
    },
    {
      label: 'Scent ID',
      icon: Brain,
      path: '/admin/scent-id',
      description: 'Profils olfactifs',
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      className={`glass-panel border-r border-admin-border flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-admin-border">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-admin-gold to-admin-gold-light flex items-center justify-center">
              <span className="text-sm font-bold text-admin-bg">R</span>
            </div>
            <span className="font-montserrat font-bold text-admin-gold text-sm tracking-tighter">
              RAYHA
            </span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 hover:bg-[#C4A97D]/10 rounded-lg transition-colors duration-200"
          title={isCollapsed ? 'Développer' : 'Réduire'}
        >
          <ChevronRight
            size={20}
            className={`text-admin-gold transition-transform duration-300 ${
              isCollapsed ? '' : 'rotate-180'
            }`}
          />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 flex flex-col gap-2 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onItemClick}
              className={`group relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                active
                  ? 'bg-gradient-to-r from-admin-gold/20 to-transparent border border-admin-gold/40 text-admin-gold'
                  : 'text-admin-text-secondary hover:text-admin-text-primary hover:bg-white/5 border border-transparent'
              }`}
              title={item.label}
            >
              {/* Gold accent on active */}
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-admin-gold to-admin-gold-light rounded-r-full" />
              )}

              {/* Icon */}
              <Icon
                size={20}
                className={`flex-shrink-0 transition-all duration-300 ${
                  active ? 'text-admin-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]' : ''
                }`}
              />

              {/* Label & Description */}
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{item.label}</div>
                  <div className="text-xs text-admin-text-secondary/60 truncate">
                    {item.description}
                  </div>
                </div>
              )}

              {/* Hover indicator */}
              {!isCollapsed && active && (
                <div className="w-2 h-2 rounded-full bg-admin-gold animate-glow-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-admin-border p-4 space-y-2">
        <button className="w-full py-2 px-3 text-sm rounded-lg bg-admin-gold/10 hover:bg-admin-gold/20 text-admin-gold transition-colors duration-200 border border-admin-gold/30 hover:border-admin-gold/50 text-center truncate">
          {isCollapsed ? '?' : 'Besoin d\'aide ?'}
        </button>
        <div className="text-xs text-admin-text-secondary/50 text-center">
          {!isCollapsed && <span>Version 1.0</span>}
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
