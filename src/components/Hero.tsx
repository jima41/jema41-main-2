import { useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useMediaQuery } from '@/hooks/use-media-query';

// ─── Animation variants ───────────────────────────────────────────────────────

const silkyEase = [0.25, 0.1, 0.25, 1] as const;

const heroContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const blurRevealVariants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 1.4, ease: silkyEase },
  },
};

const goldRevealVariants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(12px)', letterSpacing: '0em' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    letterSpacing: '0.05em',
    transition: { duration: 1.6, ease: silkyEase },
  },
};

const luxuryButtonSlideVariants = {
  hidden: { opacity: 0, x: -80 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 1.4, ease: silkyEase }
  }
};

const buttonTextContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.48, 
      staggerChildren: 0.03, 
    },
  },
};

const nobleLetterVariants = {
  hidden: { 
    opacity: 0, 
    y: 5, 
    filter: 'blur(4px)', 
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)', 
    transition: { 
      duration: 0.4, 
      ease: 'easeOut' 
    },
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

const Hero = () => {
  const hasFinePointer = useMediaQuery('(hover: hover) and (pointer: fine)');
  const isMobile = useMediaQuery('(max-width: 767px)');
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 50, damping: 30 });
  const springY = useSpring(y, { stiffness: 50, damping: 30 });

  const handleExplore = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const element = document.getElementById('notre-selection');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLElement>) => {
    if (!hasFinePointer || isMobile || typeof window === 'undefined') return;
    const normalizedX = event.clientX / window.innerWidth - 0.5;
    const normalizedY = event.clientY / window.innerHeight - 0.5;
    x.set(normalizedX * 8);
    y.set(normalizedY * -8);
  }, [hasFinePointer, x, y, isMobile]);

  const handleMouseLeave = useCallback(() => {
    x.set(0); y.set(0);
  }, [x, y]);

  const buttonText = "Explorer la Collection";

  return (
    <section
      className="grid grid-cols-1 grid-rows-1 h-[55dvh] min-h-[400px] sm:h-[650px] w-full relative isolate bg-[#FAF9F7] overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Image */}
      <motion.img
        src="images/Hero-section.webp"
        alt="Collection Parfum Rayha"
        className="absolute inset-0 w-full h-full object-cover z-0 scale-[1.03]"
        style={{ 
          x: springX, 
          y: springY,
          mixBlendMode: 'multiply' 
        }}
        loading="eager"
      />

      {/* Vignette Layer */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-white/50 via-white/20 to-transparent pointer-events-none" />

      {/* Content Layer */}
      <div className="col-start-1 row-start-1 w-full h-full z-10 flex items-center justify-start px-6 md:px-12 lg:px-24">
        <motion.div
          className="max-w-2xl text-left"
          variants={heroContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Brand Tag */}
          <motion.span
            variants={blurRevealVariants}
            className="inline-block text-[10px] sm:text-xs font-semibold text-[#A68A56] mb-4 sm:mb-5 tracking-[0.4em] uppercase"
          >
            Rayha Store — Haute Parfumerie
          </motion.span>

          {/* Title */}
          <motion.h1
            variants={blurRevealVariants}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-serif leading-tight mb-1 tracking-tight text-[#0E0E0E]"
          >
            L'Art de la
          </motion.h1>

          <motion.div variants={goldRevealVariants} className="mb-4 sm:mb-10">
            <span
              className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-serif leading-tight"
              style={{
                backgroundImage: 'linear-gradient(to right bottom, #DFBD69, #D4AF37, #B8860B)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 4px 20px rgba(212, 175, 55, 0.18))',
              }}
            >
              Parfumerie
            </span>
          </motion.div>

          {/* Description - CORRIGÉE : Le "hidden sm:block" a été retiré et la taille ajustée */}
          <motion.p
            variants={blurRevealVariants}
            className="text-[11px] sm:text-lg font-light leading-relaxed text-gray-700 mb-8 sm:mb-12 max-w-[280px] sm:max-w-md"
          >
            Une signature olfactive unique, conçue pour ceux qui cherchent l'exceptionnel.
          </motion.p>

          {/* ─── LE BOUTON BIJOU ──────────────── */}
          <motion.button
            variants={luxuryButtonSlideVariants} 
            onClick={handleExplore}
            className="group relative overflow-hidden rounded-full flex items-center justify-center"
            style={{
              backgroundColor: "#0E0E0E",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)"
            }}
            whileHover={{ 
              borderColor: "rgba(212, 175, 55, 0.6)",
              boxShadow: "0 10px 40px -5px rgba(212, 175, 55, 0.3)"
            }}
            whileTap={{ scale: 0.97, transition: { duration: 0.2 } }}
            transition={{ duration: 0.8, ease: silkyEase }}
          >
            <motion.div 
              className="relative z-10 flex items-center justify-center gap-2 sm:gap-4 px-6 py-3 sm:px-12 sm:py-5"
              initial={{ color: "#FFFFFF" }}
              whileHover={{ color: "#D4AF37" }}
              transition={{ duration: 0.6, ease: silkyEase }}
            >
              <motion.span 
                className="font-montserrat text-[8.5px] sm:text-[11px] font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase inline-block"
                variants={buttonTextContainerVariants} 
              >
                {buttonText.split("").map((char, index) => (
                  <motion.span
                    key={index}
                    variants={nobleLetterVariants} 
                    style={{ display: "inline-block", whiteSpace: "pre" }} 
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.span>
              
              <motion.svg 
                className="w-2.5 h-2.5 sm:w-3 sm:h-3" 
                viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                initial={{ x: 0, opacity: 0.8 }}
                whileHover={{ x: 5, opacity: 1 }}
                transition={{ duration: 0.6, ease: silkyEase }}
              >
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </motion.svg>
            </motion.div>
          </motion.button>
          
        </motion.div>
      </div>

      {/* Bottom fade to content */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#FAF9F7] via-[#FAF9F7]/60 to-transparent pointer-events-none" />
    </section>
  );
};

export default Hero;