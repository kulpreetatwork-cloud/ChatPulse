/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // A darker, richer background (discord-like but cleaner)
        dark: {
          bg: "#0f1117",      // Main background (very dark blue-grey)
          surface: "#1e212b", // Cards/Sidebars
          hover: "#272a35",   // Hover states
          border: "#2f3340",  // Subtle borders
        },
        // Premium Brand Color (Electric Violet/Indigo)
        brand: {
          DEFAULT: "#6366f1", // Indigo-500
          hover: "#4f46e5",   // Indigo-600
          light: "#818cf8",   // Indigo-400 (for accents)
          glow: "rgba(99, 102, 241, 0.5)" // For shadow glows
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'], // We will ensure Inter is used
      },
      boxShadow: {
        'glow': '0 0 20px rgba(99, 102, 241, 0.15)', // Subtle glow effect
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)', // Glassmorphism shadow
      }
    },
  },
  plugins: [],
}