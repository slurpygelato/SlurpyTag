/**
 * SLURPYTAG DESIGN SYSTEM & STYLE RULES
 * Use these rules for all UI components and pages.
 */

const SlurpyTheme = {
  fonts: {
    // Font principale per H1 e titoli grandi
    header: "Amatic SC, cursive",
    // Font per testi leggibili
    body: "Inter, sans-serif",
  },
  colors: {
    pink: {
      light: "#FDF2F8", // bg-slurpy-pink/30
      main: "#F9A8D4",  // primary
    },
    sky: {
      light: "#F0F9FF", // bg-slurpy-sky/50
      main: "#7DD3FC",  // info
    },
    sage: {
      light: "#F0FDF4", // bg-slurpy-sage/50
      main: "#86EFAC",  // success
    },
  },
  borderRadius: {
    card: "1.5rem", // 24px - rounded-2xl
    section: "2rem", // 32px - rounded-3xl
  },
  animations: {
    fadeIn: "fade-in 0.5s ease-out",
    float: "float 3s ease-in-out infinite",
  }
};

/* INSTRUCTIONS FOR CURSOR:
  1. All H1 tags must use "Amatic SC" with font-weight: 700.
  2. Use "shadow-slurpy" for cards: 0 10px 25px -5px rgba(0, 0, 0, 0.05).
  3. All buttons should have rounded-full or rounded-2xl.
  4. Ensure the "Public Profile" page uses Slurpy Pink for the "Call Owner" button.
*/

