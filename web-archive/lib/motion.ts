/** Shared Framer Motion spring presets from the creative direction spec. */

// Button presses, counter increments (~150ms settle)
export const snappy = { type: "spring" as const, stiffness: 400, damping: 30 };

// Card entries, section reveals (~250ms settle)
export const smooth = { type: "spring" as const, stiffness: 300, damping: 28 };

// Weather card, backgrounds (~400ms settle)
export const gentle = { type: "spring" as const, stiffness: 200, damping: 25 };

/** Stagger children variant for section cards. */
export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const staggerChild = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: smooth,
  },
};
