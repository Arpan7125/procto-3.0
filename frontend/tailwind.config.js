/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Space Grotesk"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
        display: ['"Space Grotesk"', '"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      colors: {
        accent: {
          DEFAULT: "#f59e0b",
          orange: "#ea580c",
        },
      },
      animation: {
        scanline: "scanline 8s linear infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
        "float-reverse": "float-reverse 7s ease-in-out infinite",
        aurora: "aurora 15s ease infinite",
        flicker: "flicker 3s ease-in-out infinite",
        "gradient-shift": "gradient-shift 6s ease infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        shimmer: "shimmer 3s ease-in-out infinite",
        "border-glow": "border-glow 2s ease-in-out infinite",
        marquee: "marquee 20s linear infinite",
      },
      keyframes: {
        scanline: {
          "0%": { bottom: "100%" },
          "100%": { bottom: "-100px" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "float-reverse": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(10px) rotate(1deg)" },
        },
        aurora: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
          "75%": { opacity: "0.95" },
        },
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(245, 158, 11, 0.1)" },
          "50%": { boxShadow: "0 0 40px rgba(245, 158, 11, 0.25), 0 0 80px rgba(245, 158, 11, 0.1)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "border-glow": {
          "0%, 100%": { borderColor: "rgba(245, 158, 11, 0.1)" },
          "50%": { borderColor: "rgba(245, 158, 11, 0.4)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
