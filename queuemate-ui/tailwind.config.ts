import type { Config } from "tailwindcss";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f7f8fc",
        surface: "#ffffff",
        "surface-muted": "#f3f4f6",
        border: "#e5e7eb",
        primary: "#4f46e5",
        "primary-hover": "#4338ca",
      },
    },
  },
} satisfies Config;
