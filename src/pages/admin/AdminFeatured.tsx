import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import FeaturedProductsManager from '@/components/admin/FeaturedProductsManager';

const AdminFeatured = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Vérification d'accès admin
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'admin' || user.username.trim().toLowerCase() !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  return <FeaturedProductsManager />;
};

export default AdminFeatured;
