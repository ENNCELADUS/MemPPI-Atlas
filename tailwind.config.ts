import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base colors
        primary: "#2563EB",
        background: "#F8FAFC",
        surface: "#FFFFFF",
        border: "#E5E7EB",
        
        // Text colors
        heading: "#1F2937",
        body: "#4B5563",
        muted: "#9CA3AF",
        
        // Protein family colors
        family: {
          tm: "#3B82F6",        // Transmembrane
          tf: "#10B981",        // Transcription Factor
          kinase: "#F59E0B",    // Kinase
          receptor: "#8B5CF6",  // Receptor
          other: "#6B7280",     // Other/Unknown
        },
        
        // Network enrichment colors
        enriched: "#EF4444",
        nonEnriched: "#9CA3AF",
        experimental: "#059669",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
