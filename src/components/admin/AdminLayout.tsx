import { ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Home, Menu, X } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useSyncAdminStore } from '@/hooks/use-sync-admin-store';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { logout } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  // Initialiser la synchronisation cross-device/cross-tab
  useSyncAdminStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="flex min-h-screen bg-admin-bg text-admin-text-primary">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed left-0 top-0 h-screen w-64 z-40 overflow-y-auto">
          <AdminSidebar onItemClick={() => setIsMobileSidebarOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header Bar */}
        <div className="h-16 glass-panel border-b border-admin-border flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="md:hidden p-2 hover:bg-[#C4A97D]/10 rounded-lg transition-colors"
            >
              {isMobileSidebarOpen ? (
                <X className="w-5 h-5 text-admin-gold" />
              ) : (
                <Menu className="w-5 h-5 text-admin-gold" />
              )}
            </button>

            <h1 className="text-xl md:text-2xl font-montserrat font-bold tracking-tighter text-admin-gold">
              Rayha
            </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            {/* Retour au site */}
            <Link
              to="/"
              className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg bg-admin-bg hover:bg-admin-card/50 border border-admin-border/30 hover:border-admin-gold/50 transition-all text-admin-text-secondary hover:text-admin-text-primary"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm hidden md:inline">Site</span>
            </Link>

            {/* Déconnexion */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg bg-red-900/20 hover:bg-red-900/40 border border-red-700/50 hover:border-red-700 transition-all text-red-400 hover:text-red-300"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm hidden md:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
