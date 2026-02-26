import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import bannerLayering from '@/assets/bannerlayering.webp';
// Remplacement de l'ancienne image par la nouvelle
import bannerParfumer from '@/assets/bannerparfumer.webp';

const silkyEase = [0.25, 0.1, 0.25, 1] as const;

const banners = [
  {
    tag: 'Masterclass Olfactive',
    title: "L'Art de se Parfumer",
    description:
      "Le parfum est une signature invisible, une aura qui vous précède et s'attarde après votre départ.",
    // Utilisation de la nouvelle image importée
    image: bannerParfumer,
    path: '/art-de-se-parfumer',
  },
  {
    tag: 'Savoir-Faire',
    title: "L'Art de Combiner",
    description:
      'Superposez les fragrances. Créez votre signature olfactive unique.',
    image: bannerLayering,
    path: '/art-du-layering',
  },
];

const SavoirFaireBanners = () => {
  return (
    <section className="py-12 md:py-16 lg:py-20 px-5 sm:px-6 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">

        {/* Titre de section */}
        <motion.div
          className="text-center mb-10 md:mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: silkyEase }}
        >
          <span className="text-[10px] md:text-xs text-[#A68A56] uppercase tracking-[0.3em] mb-3 block font-medium">
            Nos Guides
          </span>
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl text-[#1a1a1a]">
            Le Savoir-Faire Rayha
          </h2>
          <div className="h-px w-12 bg-[#D4AF37]/50 mx-auto mt-4" />
        </motion.div>

        {/* Grille 2 colonnes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {banners.map((banner, i) => (
            <motion.div
              key={banner.path}
              className="relative h-[200px] sm:h-[240px] md:h-[280px] lg:h-[360px] xl:h-[420px] rounded-xl md:rounded-2xl overflow-hidden group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.15, ease: silkyEase }}
            >
              {/* Image de fond */}
              <motion.img
                src={banner.image}
                alt={banner.title}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 1.2, ease: silkyEase }}
              />

              {/* Overlays */}
              <div className="absolute inset-0 bg-black/45 group-hover:bg-black/55 transition-colors duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Contenu */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 lg:p-10 xl:p-12">
                <span className="text-[10px] lg:text-xs text-[#D4AF37] uppercase tracking-[0.3em] mb-2 block font-medium">
                  {banner.tag}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white mb-2 drop-shadow-lg leading-tight">
                  {banner.title}
                </h3>
                <p className="text-xs md:text-sm text-white/70 font-light leading-relaxed mb-5 max-w-sm">
                  {banner.description}
                </p>

                {/* Bouton Découvrir */}
                <Link
                  to={banner.path}
                  className="inline-flex items-center gap-2 self-start px-5 py-2.5 rounded-lg text-[11px] font-bold tracking-[0.15em] uppercase transition-all duration-300"
                  style={{
                    backgroundColor: 'rgba(14,14,14,0.85)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#FFFFFF',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.6)';
                    (e.currentTarget as HTMLElement).style.color = '#D4AF37';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)';
                    (e.currentTarget as HTMLElement).style.color = '#FFFFFF';
                  }}
                >
                  Découvrir
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SavoirFaireBanners;