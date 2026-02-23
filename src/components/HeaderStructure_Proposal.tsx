/**
 * PROPOSED HEADER STRUCTURE - "Haute Parfumerie Digitale"
 * 
 * Architecture globale :
 * 
 * <Header>
 *   ├─ 1. SHIPPING BAR (Nouvelle)
 *   │  └─ "L'EXCELLENCE OLFACTIVE, LIVRÉE CHEZ VOUS."
 *   │     Style : 24px height, champagne bg (#FDFBF7), text 10px, letter-spacing
 *   │
 *   └─ 2. MAIN HEADER (Refactorisé)
 *      ├─ Logo Section (Typographie contrastée)
 *      │  ├─ "Rayha" → Serif (Cormorant Garamond-like), letter-spacing: 0.15em
 *      │  └─ "STORE" → Sans-serif Light (Montserrat), letter-spacing: 0.15em
 *      │
 *      ├─ Desktop Navigation (Animations Glassmorphism)
 *      │  ├─ Links: Femme, Homme, Unisex, Tous nos Parfums
 *      │  ├─ Animation au survol: Ligne dorée (#D4AF37) se déploie du centre
 *      │  └─ Implémentation: Framer Motion + clip-path
 *      │
 *      ├─ Actions (Icons)
 *      │  ├─ Search → Bronze brossé (#A68A56), Thin, hover animation
 *      │  ├─ Cart → Bronze brossé (#A68A56), Thin, hover animation
 *      │  └─ Profile → Bronze brossé (#A68A56), Thin, hover animation
 *      │
 *      ├─ Mobile Menu Toggle (Bronze brossé)
 *      │
 *      └─ Mobile Menu (Glassmorphism)
 *         └─ Hérite du style du main header
 *
 * Effets dynamiques :
 * ─────────────────
 * - Scroll effect: À > 40px. Hauteur header -15%, opacité blur +
 * - Glassmorphism: bg-white/40 + backdrop-blur-xl (20px)
 * - Bordure: 0.5px rgba(212, 175, 55, 0.2) (Or doux)
 * 
 * Imports nécessaires :
 * ─────────────────────
 * - framer-motion: pour animations NavLink hover
 * - lucide-react: Icons (Search, ShoppingBag, User, Menu, X, etc.)
 * - lodash throttle: pour scroll optimization
 * 
 * CSS Custom (Tailwind extensions) :
 * ──────────────────────────────────
 * - @import Cormorant Garamond (Google Fonts)
 * - @import Montserrat Light (Google Fonts)
 * - Tailwind: font-serif → Cormorant Garamond
 * - Tailwind: font-sans → Montserrat
 */

// STRUCTURE DÉTAILLÉE EN COMPOSANTS

interface HeaderScrollState {
  scrollY: number;
  isScrolled: boolean;
  headerScale: number; // 1.0 → 0.85
  backdropOpacity: number; // 0.4 → 0.5
}

export interface NavLink {
  label: string;
  href: string;
}

/**
 * Component: <Header />
 * État :
 * - scrollState: HeaderScrollState
 * - isMenuOpen: boolean
 * - isSearchOpen: boolean
 * - searchQuery: string
 * - isProfileOpen: boolean
 * 
 * Handlers :
 * - useEffect: scroll listener (throttled à 30fps)
 * - handleSearch(query)
 * - handleLogout()
 * - toggleMenu()
 */

/**
 * Component: <ShippingBar />
 * Props: none (Static)
 * 
 * Contenu : "L'EXCELLENCE OLFACTIVE, LIVRÉE CHEZ VOUS."
 * Style :
 * - height: 24px
 * - bg: #FDFBF7 (champagne)
 * - text: gray-500, size 10px
 * - letter-spacing: 0.2em
 * - font-weight: 500
 */

/**
 * Component: <Logo />
 * Props: none
 * 
 * Structure HTML :
 * <a href="/" className="flex items-center gap-0">
 *   <span className="font-serif text-2xl tracking-[0.15em]">
 *     Rayha
 *   </span>
 *   <span className="font-sans text-xs font-light tracking-[0.15em]">
 *     STORE
 *   </span>
 * </a>
 * 
 * Styles Tailwind :
 * - Rayha: font-serif (Cormorant), text-2xl, letter-spacing-widest
 * - STORE: font-light, text-xs, uppercase, letter-spacing-wider
 * - Gradient optionnel: from-foreground to-foreground/80
 */

/**
 * Component: <NavLink />
 * Props:
 * - label: string
 * - href: string
 * - isActive?: boolean
 * 
 * Animation au survol :
 * - État initial: pas de ligne
 * - Au hover: Ligne dorée (#D4AF37) émerge du centre vers les bords
 * - Implémentation:
 *   * Container: position-relative
 *   * Pseudo-element ou <span>: position-absolute, bottom-0
 *   * Animation: clipPath de 0% à 100% en 0.3s
 *   * Style: border-b-[1px] border-[#D4AF37]
 * 
 * Framer Motion code (pseudocode) :
 * const underlineVariants = {
 *   idle: { scaleX: 0, opacity: 0 },
 *   hover: { scaleX: 1, opacity: 1 }
 * }
 * <motion.div
 *   variants={underlineVariants}
 *   initial="idle"
 *   whileHover="hover"
 *   transition={{ duration: 0.3 }}
 * />
 */

/**
 * Component: <ActionIcon />
 * Props:
 * - icon: React.ReactNode (lucide icon)
 * - onClick: () => void
 * - badge?: number (pour cart)
 * - title?: string
 * 
 * Style :
 * - Couleur: #A68A56 (bronze brossé)
 * - Épaisseur: stroke-width: 1.5 (thin)
 * - Hover: opacity-70, scale-110 (0.2s transition)
 * - Background hover: bg-amber-50/20
 * 
 * Icones impactées :
 * - Search
 * - ShoppingBag (avec badge)
 * - User
 * - Settings (admin)
 */

/**
 * Component: <MobileMenuToggle />
 * Props:
 * - isOpen: boolean
 * - onClick: () => void
 * 
 * Style :
 * - Icon: Menu/X en bronze brossé (#A68A56)
 * - Background hover: bg-amber-50/20
 * - Transition smooth (0.3s)
 */

/**
 * Component: <MobileMenu />
 * Props:
 * - isOpen: boolean
 * - navLinks: NavLink[]
 * 
 * Style :
 * - Hérite glassmorphism du header
 * - Bordure top: 0.5px rgba(212, 175, 55, 0.2)
 * - Padding: py-4 px-6
 * - Navigation links: même style hover que desktop (si possible)
 */

/**
 * CSS Classes à ajouter à tailwind.config.ts :
 * ───────────────────────────────────────────
 * 
 * theme: {
 *   extend: {
 *     fontFamily: {
 *       'serif': ['Cormorant Garamond', 'serif'],
 *       'sans': ['Montserrat', 'sans-serif'],
 *     },
 *     colors: {
 *       'gold': '#D4AF37',
 *       'bronze': '#A68A56',
 *       'champagne': '#FDFBF7',
 *     },
 *     backdropBlur: {
 *       'xl': '20px',
 *     },
 *     borderWidth: {
 *       'hairline': '0.5px',
 *     },
 *   }
 * }
 * 
 * @layer components {
 *   .glassmorphism {
 *     @apply bg-white/40 backdrop-blur-xl border-b border-[rgba(212,175,55,0.2)];
 *   }
 *   .shipping-bar {
 *     @apply h-6 bg-[#FDFBF7] text-[#6B7280] text-[10px] tracking-[0.2em];
 *   }
 *   .nav-gold-underline {
 *     @apply relative cursor-pointer pb-1;
 *   }
 * }
 * 
 * @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&display=swap');
 * @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;500&display=swap');
 */

export default {};
