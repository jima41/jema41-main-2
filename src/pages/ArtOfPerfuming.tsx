import { motion } from 'framer-motion';
import { ArrowLeft, Wind, Sun, Moon, Sparkles, Droplets, Flame, Snowflake } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';
import image2 from '@/assets/bannerparfumer.webp'

// Courbe très douce pour les animations "luxe"
const silkyEase = [0.25, 0.1, 0.25, 1];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: silkyEase } }
};

const ArtOfPerfuming = () => {
  const navigate = useNavigate();

  // Données des familles olfactives
  const families = [
    {
      name: "Les Boisés",
      description: "Profonds, élégants et charismatiques. Ils laissent un sillage texturé et inoubliable.",
      season: "Automne / Hiver",
      seasonIcon: <Snowflake className="w-4 h-4 text-[#D4AF37]" />,
      moment: "Le Soir / Rendez-vous",
      momentIcon: <Moon className="w-4 h-4 text-[#D4AF37]" />,
      temperature: "Idéal par temps frais",
      notes: "Cèdre, Santal, Vétiver, Oud"
    },
    {
      name: "Les Orientaux & Ambrés",
      description: "Chauds, envoûtants et mystérieux. Une signature sensuelle qui fusionne avec la peau.",
      season: "Hiver",
      seasonIcon: <Flame className="w-4 h-4 text-[#D4AF37]" />,
      moment: "La Nuit / Occasions Spéciales",
      momentIcon: <Sparkles className="w-4 h-4 text-[#D4AF37]" />,
      temperature: "Sublimé par le froid",
      notes: "Vanille, Ambre, Fève Tonka, Épices"
    },
    {
      name: "Les Floraux",
      description: "Lumineux, romantiques et intemporels. L'essence même de l'élégance absolue.",
      season: "Printemps / Été",
      seasonIcon: <Sun className="w-4 h-4 text-[#D4AF37]" />,
      moment: "En Journée / Quotidien",
      momentIcon: <Sun className="w-4 h-4 text-[#D4AF37]" />,
      temperature: "Parfait sous la douceur du soleil",
      notes: "Rose, Jasmin, Tubéreuse, Iris"
    },
    {
      name: "Les Frais & Hespéridés",
      description: "Vibrants, énergisants et purs. Comme une brise légère sur une peau nue.",
      season: "Été / Fortes Chaleurs",
      seasonIcon: <Wind className="w-4 h-4 text-[#D4AF37]" />,
      moment: "Le Matin / Après le sport",
      momentIcon: <Sun className="w-4 h-4 text-[#D4AF37]" />,
      temperature: "Révélé par la chaleur de la peau",
      notes: "Bergamote, Citron, Néroli, Notes Marines"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF9]">
      <main className="flex-1 py-8 md:py-12 lg:py-16 px-5 sm:px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">

          {/* Bouton Retour */}
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-[#1a1a1a]/50 hover:text-[#1a1a1a] transition-colors mb-8 md:mb-12 text-[10px] md:text-xs tracking-[0.15em] uppercase font-medium min-h-10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour
          </button>

          {/* ── BANNIÈRE HERO ── */}
          <motion.div
            className="relative w-full h-[200px] sm:h-[260px] md:h-[340px] rounded-xl md:rounded-2xl overflow-hidden mb-16 md:mb-24"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: silkyEase }}
          >
            <img
              src={image2}
              alt="L'Art de se Parfumer"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            <motion.div
              className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.span variants={fadeUpItem} className="text-[10px] md:text-xs text-[#D4AF37] uppercase tracking-[0.3em] mb-3 block font-medium">
                Masterclass Olfactive
              </motion.span>
              <motion.h1 variants={fadeUpItem} className="font-serif text-3xl md:text-5xl lg:text-6xl font-normal mb-4 text-white leading-tight drop-shadow-lg">
                L'Art de se Parfumer
              </motion.h1>
              <motion.div variants={fadeUpItem} className="h-px w-16 bg-[#D4AF37] mb-4 opacity-80" />
              <motion.p variants={fadeUpItem} className="text-xs md:text-sm text-white/75 font-light leading-relaxed max-w-xl">
                Le parfum est une signature invisible, une aura qui vous précède et s'attarde après votre départ.
              </motion.p>
            </motion.div>
          </motion.div>

          {/* ── SECTION 1 : LE RITUEL (Comment se parfumer) ── */}
          <motion.div
            className="mb-24 md:mb-32"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeUpItem} className="font-serif text-2xl md:text-4xl text-center mb-12 md:mb-16 text-[#1a1a1a]">
              Le Rituel Parfait
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {/* Point 1 : La Distance */}
              <motion.div variants={fadeUpItem} className="bg-white p-8 md:p-10 rounded-2xl border border-[#EAEAEA] shadow-sm text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="w-12 h-12 bg-[#F9F9F9] rounded-full flex items-center justify-center mx-auto mb-6 text-[#A68A56]">
                  <Wind className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl mb-3 text-[#1a1a1a]">La Distance Idéale</h3>
                <p className="text-sm text-[#666666] leading-relaxed">
                  Vaporisez votre parfum à environ <strong className="text-[#1a1a1a] font-medium">15 à 20 centimètres</strong> de votre peau. Cette distance permet au jus de se diffuser en un voile large et homogène, évitant de concentrer l'alcool sur une seule zone.
                </p>
              </motion.div>

              {/* Point 2 : Les Points de Pulsation */}
              <motion.div variants={fadeUpItem} className="bg-white p-8 md:p-10 rounded-2xl border border-[#EAEAEA] shadow-sm text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="w-12 h-12 bg-[#F9F9F9] rounded-full flex items-center justify-center mx-auto mb-6 text-[#A68A56]">
                  <Droplets className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl mb-3 text-[#1a1a1a]">Les Points de Pulsation</h3>
                <p className="text-sm text-[#666666] leading-relaxed">
                  Ciblez les zones où la chaleur corporelle est la plus forte : <strong className="text-[#1a1a1a] font-medium">le cou, derrière les oreilles, au creux des poignets et à l'intérieur des coudes</strong>. La chaleur agit comme un diffuseur naturel.
                </p>
              </motion.div>

              {/* Point 3 : Le Geste à Bannir */}
              <motion.div variants={fadeUpItem} className="bg-white p-8 md:p-10 rounded-2xl border border-[#EAEAEA] shadow-sm text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="w-12 h-12 bg-[#F9F9F9] rounded-full flex items-center justify-center mx-auto mb-6 text-[#A68A56]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl mb-3 text-[#1a1a1a]">Le Geste à Bannir</h3>
                <p className="text-sm text-[#666666] leading-relaxed">
                  <strong className="text-[#1a1a1a] font-medium">Ne frottez jamais vos poignets l'un contre l'autre.</strong> Cette friction génère de la chaleur qui "brise" les molécules délicates des notes de tête, altérant le développement naturel de la fragrance.
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* ── SECTION 2 : LES FAMILLES ET LE CLIMAT ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeUpItem} className="font-serif text-2xl md:text-4xl text-center mb-4 text-[#1a1a1a]">
              Quand porter sa fragrance ?
            </motion.h2>
            <motion.p variants={fadeUpItem} className="text-center text-sm text-[#666666] mb-12 md:mb-16 max-w-2xl mx-auto">
              La température et l'humidité influencent l'évolution d'un parfum. Découvrez comment accorder votre sillage à la météo et à vos émotions.
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {families.map((family, index) => (
                <motion.div
                  key={index}
                  variants={fadeUpItem}
                  className="bg-[#0E0E0E] rounded-2xl p-8 md:p-10 border border-white/10 relative overflow-hidden group"
                  style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 text-white transform scale-150 group-hover:scale-110 transition-transform duration-1000">
                    {family.seasonIcon}
                  </div>

                  <h3 className="font-serif text-2xl text-white mb-2">{family.name}</h3>
                  <p className="text-sm text-white/60 mb-6 font-light leading-relaxed">
                    {family.description}
                  </p>

                  <div className="space-y-4 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center flex-shrink-0 border border-white/5">
                        {family.seasonIcon}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-[#A68A56]">Saison Idéale</p>
                        <p className="text-sm text-white/90">{family.season}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center flex-shrink-0 border border-white/5">
                        {family.momentIcon}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-[#A68A56]">Moment Parfait</p>
                        <p className="text-sm text-white/90">{family.moment}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10">
                    <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1.5">Notes Emblématiques</p>
                    <p className="text-xs text-[#D4AF37] italic">{family.notes}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── APPEL À L'ACTION FINALE ── */}
          <motion.div
            className="mt-24 md:mt-32 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpItem}
          >
            <h3 className="font-serif text-2xl md:text-3xl mb-6 text-[#1a1a1a]">
              Prêt à trouver votre signature olfactive ?
            </h3>
            <motion.button
              onClick={() => navigate('/all-products')}
              className="group relative overflow-hidden rounded-lg inline-flex items-center justify-center"
              style={{
                backgroundColor: "#0E0E0E",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: "0 4px 15px -5px rgba(0, 0, 0, 0.3)"
              }}
              whileHover={{
                borderColor: "rgba(212, 175, 55, 0.6)",
                boxShadow: "0 10px 30px -5px rgba(212, 175, 55, 0.25)"
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.8, ease: silkyEase }}
            >
              <motion.div
                className="relative z-10 flex items-center justify-center gap-3 px-8 py-4 w-full"
                initial={{ color: "#FFFFFF" }}
                whileHover={{ color: "#D4AF37" }}
                transition={{ duration: 0.6, ease: silkyEase }}
              >
                <span className="font-montserrat text-xs font-bold tracking-[0.2em] uppercase">
                  Explorer la collection
                </span>
                <Sparkles className="w-4 h-4" />
              </motion.div>
            </motion.button>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ArtOfPerfuming;
