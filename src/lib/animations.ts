/**
 * Centralized Framer Motion animation system for Rayha Store
 * Luxury aesthetic: smooth deceleration, elegant reveals, consistent spring physics
 */
import type { Variants } from 'framer-motion';

// Premium easing curve — smooth deceleration (luxury feel)
export const luxuryEase = [0.22, 1, 0.36, 1] as const;

// Standard easeIn cubic-bezier (for exit transitions)
const easeIn = [0.42, 0, 1, 1] as const;

// ─── Page Transitions ─────────────────────────────────────────────────────────
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: luxuryEase },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.25, ease: easeIn },
  },
};

// ─── Section Reveal (scroll) ──────────────────────────────────────────────────
export const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: luxuryEase },
  },
};

// Horizontal slide from left
export const slideLeftVariants = {
  hidden: { opacity: 0, x: -28 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: luxuryEase },
  },
};

// Horizontal slide from right
export const slideRightVariants = {
  hidden: { opacity: 0, x: 28 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: luxuryEase },
  },
};

// Simple fade in
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

// ─── Stagger System ───────────────────────────────────────────────────────────
// Parent container — triggers staggered children
export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// Child item — used inside a staggerContainer
export const staggerItemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: luxuryEase },
  },
};

// ─── Viewport Config ──────────────────────────────────────────────────────────
// once: true = animations do NOT replay on scroll back (premium feel)
export const viewportOnce = { once: true, margin: '-80px' };

// ─── Spring Config (interactions) ────────────────────────────────────────────
export const luxurySpring = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 30,
  mass: 0.8,
};
