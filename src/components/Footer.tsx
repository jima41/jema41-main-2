import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import {
  slideLeftVariants,
  staggerContainerVariants,
  staggerItemVariants,
  sectionVariants,
  fadeInVariants,
  viewportOnce,
} from '@/lib/animations';

// Courbe très douce pour le survol
const silkyEase = [0.25, 0.1, 0.25, 1];

const Footer = () => {
  const [email, setEmail] = useState('');

  return (
    <footer className="bg-[#0a0a0a] text-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-20 pt-16 pb-0">

        {/* ── Main grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 pb-14 border-b border-white/10">

          {/* Col 1 — Brand & Social */}
          <motion.div
            variants={slideLeftVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="sm:col-span-2 lg:col-span-1"
          >
            {/* Social icons - MIS À JOUR AVEC LE DESIGN LUXE */}
            <div className="flex gap-4 mb-8">
              {/* Instagram */}
              <motion.a
                href="#"
                aria-label="Instagram Rayha Store"
                className="group relative flex items-center justify-center w-10 h-10 rounded-full overflow-hidden"
                style={{
                  backgroundColor: "#0E0E0E",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  boxShadow: "0 4px 15px -5px rgba(0, 0, 0, 0.3)"
                }}
                whileHover={{ 
                  borderColor: "rgba(212, 175, 55, 0.6)",
                  boxShadow: "0 10px 30px -5px rgba(212, 175, 55, 0.25)"
                }}
                whileTap={{ scale: 0.95, transition: { duration: 0.2 } }}
                transition={{ duration: 0.8, ease: silkyEase }}
              >
                <motion.div
                  className="relative z-10 flex items-center justify-center"
                  initial={{ color: "#FFFFFF" }}
                  whileHover={{ color: "#D4AF37", scale: 1.1 }}
                  transition={{ duration: 0.6, ease: silkyEase }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
                  </svg>
                </motion.div>
              </motion.a>

              {/* Facebook */}
              <motion.a
                href="#"
                aria-label="Facebook Rayha Store"
                className="group relative flex items-center justify-center w-10 h-10 rounded-full overflow-hidden"
                style={{
                  backgroundColor: "#0E0E0E",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  boxShadow: "0 4px 15px -5px rgba(0, 0, 0, 0.3)"
                }}
                whileHover={{ 
                  borderColor: "rgba(212, 175, 55, 0.6)",
                  boxShadow: "0 10px 30px -5px rgba(212, 175, 55, 0.25)"
                }}
                whileTap={{ scale: 0.95, transition: { duration: 0.2 } }}
                transition={{ duration: 0.8, ease: silkyEase }}
              >
                <motion.div
                  className="relative z-10 flex items-center justify-center"
                  initial={{ color: "#FFFFFF" }}
                  whileHover={{ color: "#D4AF37", scale: 1.1 }}
                  transition={{ duration: 0.6, ease: silkyEase }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </motion.div>
              </motion.a>

              {/* Contact */}
              <motion.a
                href="#"
                aria-label="Contacter Rayha Store"
                className="group relative flex items-center justify-center w-10 h-10 rounded-full overflow-hidden"
                style={{
                  backgroundColor: "#0E0E0E",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  boxShadow: "0 4px 15px -5px rgba(0, 0, 0, 0.3)"
                }}
                whileHover={{ 
                  borderColor: "rgba(212, 175, 55, 0.6)",
                  boxShadow: "0 10px 30px -5px rgba(212, 175, 55, 0.25)"
                }}
                whileTap={{ scale: 0.95, transition: { duration: 0.2 } }}
                transition={{ duration: 0.8, ease: silkyEase }}
              >
                <motion.div
                  className="relative z-10 flex items-center justify-center"
                  initial={{ color: "#FFFFFF" }}
                  whileHover={{ color: "#D4AF37", scale: 1.1 }}
                  transition={{ duration: 0.6, ease: silkyEase }}
                >
                  <Mail className="w-4 h-4" />
                </motion.div>
              </motion.a>
            </div>

            <div className="flex items-center gap-0 mb-3">
              <span className="font-serif text-2xl md:text-3xl font-normal tracking-widest text-white">
                Rayha
              </span>
              <span className="font-sans text-xs font-light tracking-widest text-white/70 uppercase ml-1 pt-1">
                Store
              </span>
            </div>
            <p className="text-white/40 text-sm font-light leading-relaxed max-w-[220px]">
              L'art de la parfumerie de luxe, accessible à tous.
            </p>
          </motion.div>

          {/* Col 2 — Navigation */}
          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <motion.h4
              variants={staggerItemVariants}
              className="text-[10px] font-medium uppercase tracking-[0.25em] mb-6 text-white/35"
            >
              Navigation
            </motion.h4>
            <ul className="space-y-4">
              <motion.li variants={staggerItemVariants}>
                <Link to="/all-products" className="text-sm text-white/55 font-light hover:text-white transition-colors duration-200">
                  Tous les Parfums
                </Link>
              </motion.li>
              <motion.li variants={staggerItemVariants}>
                <Link to="/art-de-se-parfumer" className="text-sm text-white/55 font-light hover:text-white transition-colors duration-200">
                  L'Art de se Parfumer
                </Link>
              </motion.li>
              <motion.li variants={staggerItemVariants}>
                <Link to="/art-du-layering" className="text-sm text-white/55 font-light hover:text-white transition-colors duration-200">
                  L'Art de Combiner
                </Link>
              </motion.li>
            </ul>
          </motion.div>

          {/* Col 3 — Support */}
          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <motion.h4
              variants={staggerItemVariants}
              className="text-[10px] font-medium uppercase tracking-[0.25em] mb-6 text-white/35"
            >
              Support
            </motion.h4>
            <ul className="space-y-4">
              {['Contact', 'FAQ', 'Livraison', 'Retours'].map((label) => (
                <motion.li key={label} variants={staggerItemVariants}>
                  <a href="#" className="text-sm text-white/55 font-light hover:text-white transition-colors duration-200">
                    {label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Col 4 — Newsletter */}
          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <motion.h4
              variants={staggerItemVariants}
              className="text-[10px] font-medium uppercase tracking-[0.25em] mb-6 text-white/35"
            >
              Newsletter
            </motion.h4>
            <motion.p
              variants={staggerItemVariants}
              className="text-sm text-white/40 font-light mb-4 leading-relaxed"
            >
              Inscrivez-vous pour recevoir nos offres exclusives.
            </motion.p>
            <motion.div variants={staggerItemVariants} className="flex flex-col gap-2.5 mt-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre email"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white text-base md:text-sm placeholder:text-white/25 focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/10 transition-colors duration-300"
              />
              
              {/* BOUTON S'INSCRIRE LUXE */}
              <motion.button
                className="group relative w-full overflow-hidden rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: "#0E0E0E",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  boxShadow: "0 4px 15px -5px rgba(0, 0, 0, 0.3)"
                }}
                whileHover={{ 
                  borderColor: "rgba(212, 175, 55, 0.6)",
                  boxShadow: "0 10px 30px -5px rgba(212, 175, 55, 0.25)"
                }}
                whileTap={{ scale: 0.98, transition: { duration: 0.2 } }}
                transition={{ duration: 0.8, ease: silkyEase }}
              >
                <motion.div 
                  className="relative z-10 flex items-center justify-center gap-3 px-4 py-3 w-full"
                  initial={{ color: "#FFFFFF" }}
                  whileHover={{ color: "#D4AF37" }}
                  transition={{ duration: 0.6, ease: silkyEase }}
                >
                  <span className="font-montserrat text-[11px] font-bold tracking-[0.2em] uppercase">
                    S'inscrire
                  </span>
                  
                  <motion.svg 
                    width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                    initial={{ x: 0, opacity: 0.8 }}
                    whileHover={{ x: 4, opacity: 1 }}
                    transition={{ duration: 0.6, ease: silkyEase }}
                  >
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </motion.svg>
                </motion.div>
              </motion.button>
              
            </motion.div>
          </motion.div>
        </div>

        {/* ── Bottom bar ────────────────────────────────────────── */}
        <motion.div
          className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <p className="text-xs text-white/25 font-light max-w-xs leading-relaxed">
            Découvrez des fragrances d'exception qui racontent votre histoire.
          </p>
          <motion.div
            className="flex flex-wrap items-center gap-1"
            variants={fadeInVariants}
          >
            <a href="#" className="text-[10px] uppercase tracking-[0.2em] text-white/30 hover:text-white/60 transition-colors min-h-[44px] flex items-center px-3">
              Mentions légales
            </a>
            <a href="#" className="text-[10px] uppercase tracking-[0.2em] text-white/30 hover:text-white/60 transition-colors min-h-[44px] flex items-center px-3">
              Confidentialité
            </a>
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/20 min-h-[44px] flex items-center px-3">
              © 2026 Rayha Store
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Giant brand name — filigrane ──────────────────────── */}
      <div className="overflow-hidden leading-none mt-2 select-none pointer-events-none">
        <p
          className="font-bold text-white whitespace-nowrap tracking-tight -mb-[0.15em]"
          style={{ 
            fontSize: 'clamp(5rem, 16vw, 18rem)', 
            opacity: 0.035,
            fontFamily: "'Playfair Display', 'Didot', 'Bodoni MT', 'Times New Roman', serif"
          }}
        >
          RAYHA.—
        </p>
      </div>
    </footer>
  );
};

export default Footer;