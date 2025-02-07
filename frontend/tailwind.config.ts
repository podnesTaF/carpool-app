import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "hsl(var(--primary-black))",
          white: "hsl(var(--primary-white))",
          orange: "hsl(var(--primary-orange))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary-dark))",
          medium: "hsl(var(--secondary-medium))",
          light: "hsl(var(--secondary-light))",
        },
        gray: {
          "300": "hsl(var(--gray-300))",
          "500": "hsl(var(--gray-500))",
          "700": "hsl(var(--gray-700))",
          "800": "hsl(var(--gray-800))",
          "900": "hsl(var(--gray-900))",
        },
        background: {
          DEFAULT: "hsl(var(--background))",
        },
        success: {
          DEFAULT: "hsl(var(--success)",
          light: "hsl(var(--success-light))",
        },
        destructive: {
          DEFAULT: "hsl(var(--danger))",
          light: "hsl(var(--danger-light)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      transitionProperty: {
        height: "height",
        spacing: "margin, padding",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("tailwindcss-animated")],
} satisfies Config;
