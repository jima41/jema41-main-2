import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { sectionVariants } from '@/lib/animations';

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.error('404:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div
        className="text-center max-w-sm mx-auto"
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <p className="font-serif text-8xl sm:text-9xl font-light text-[#D4AF37]/25 mb-2 leading-none">
          404
        </p>
        <h1 className="font-serif text-2xl sm:text-3xl font-normal mb-3 text-foreground">
          Page introuvable
        </h1>
        <p className="text-sm text-foreground/60 mb-8 leading-relaxed max-w-xs mx-auto">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <motion.button
          onClick={() => navigate('/')}
          className="inline-flex items-center justify-center px-6 py-3 min-h-[48px] rounded-lg border border-border/40 hover:border-[#D4AF37]/60 text-sm font-medium text-foreground transition-all"
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          Retour à l'accueil
        </motion.button>
      </motion.div>
    </div>
  );
};

export default NotFound;
