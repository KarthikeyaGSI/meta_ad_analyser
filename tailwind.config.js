/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#08090C",
        surface: "#0F111A",
        "surface-hover": "#161924",
        card: "rgba(255, 255, 255, 0.035)",
        border: "rgba(255, 255, 255, 0.08)",
        primary: {
          DEFAULT: "var(--color-primary, #6366F1)",
          hover: "var(--color-primary-hover, #4F46E5)",
        },
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        muted: "#94A3B8",
        apple: {
          obsidian: "#0B0D13",
          darkGray: "#11131A",
          gray: "#151821",
          lightGray: "#1C1F2B",
          glass: "rgba(255, 255, 255, 0.04)"
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "glass-gradient": "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
        "apple-grid": "linear-gradient(rgba(255, 255, 255, 0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.01) 1px, transparent 1px)"
      },
      boxShadow: {
        "glass-shadow": "0 8px 40px 0 rgba(0, 0, 0, 0.45)",
        "glass-shadow-premium": "0 24px 60px -12px rgba(0, 0, 0, 0.65), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)",
        "glow-primary": "0 0 20px 0 rgba(99, 102, 241, 0.1)",
        "glow-success": "0 0 20px 0 rgba(16, 185, 129, 0.08)",
      }
    },
  },
  plugins: [],
};
