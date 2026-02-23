import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      colors: {
        // Admin dark theme
        admin: {
          bg: "#0F1115",
          card: "#1A1D23",
          gold: "#D4AF37",
          "gold-light": "#F0D595",
          "text-primary": "#FFFFFF",
          "text-secondary": "#9CA3AF",
          border: "rgba(212, 175, 55, 0.2)",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom luxury colors
        champagne: "hsl(var(--champagne))",
        bronze: {
          DEFAULT: "hsl(var(--bronze))",
          dark: "hsl(var(--bronze-dark))",
        },
        cream: {
          DEFAULT: "hsl(var(--cream))",
          light: "hsl(var(--cream-light))",
        },
        charcoal: {
          DEFAULT: "hsl(var(--charcoal))",
          light: "hsl(var(--charcoal-light))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-out-right": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(100%)" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 20px rgba(212, 175, 55, 0.5)" },
          "50%": { opacity: "0.8", boxShadow: "0 0 30px rgba(212, 175, 55, 0.8)" },
        },
        "shimmer": {
          "0%": { left: "-100%" },
          "50%, 100%": { left: "100%" },
        },
        "underline-expand": {
          "0%": { transform: "scaleX(0)", transformOrigin: "center" },
          "100%": { transform: "scaleX(1)", transformOrigin: "center" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.6s ease-out forwards",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "slide-in-right": "slide-in-right 0.3s ease-out forwards",
        "slide-out-right": "slide-out-right 0.3s ease-out forwards",
        "slide-in-left": "slide-in-left 0.3s ease-out forwards",
        "scale-in": "scale-in 0.2s ease-out forwards",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "shimmer": "shimmer 3s infinite",
        "underline-expand": "underline-expand 0.3s ease-out forwards",
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.15)',
        'glass-gold': '0 0 20px rgba(212, 175, 55, 0.3), inset 0 0 20px rgba(212, 175, 55, 0.1)',
        'luxury': '0 10px 30px rgba(212, 175, 55, 0.2)',
        'product': '0 20px 40px rgba(0, 0, 0, 0.1)',
      },
      letterSpacing: {
        tighter: '-0.05em',
        widest: '0.15em',
        shipping: '0.2em',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
