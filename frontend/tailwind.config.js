/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      // ── Colors from DESIGN.md (Vitality Digital Health) ──
      colors: {
        // Surfaces
        "surface":                   "#f3fcef",
        "surface-dim":               "#d4ddd0",
        "surface-bright":            "#f3fcef",
        "surface-container-lowest":  "#ffffff",
        "surface-container-low":     "#edf6ea",
        "surface-container":         "#e8f0e4",
        "surface-container-high":    "#e2ebde",
        "surface-container-highest": "#dce5d9",
        "surface-variant":           "#dce5d9",
        "surface-tint":              "#006e2f",
        "background":                "#f3fcef",
        "inverse-surface":           "#2a322a",

        // On-colors
        "on-surface":          "#161d16",
        "on-surface-variant":  "#3d4a3d",
        "on-background":       "#161d16",
        "inverse-on-surface":  "#ebf3e7",

        // Primary (Deep Green)
        "primary":             "#006e2f",
        "on-primary":          "#ffffff",
        "primary-container":   "#22c55e",
        "on-primary-container":"#004b1e",
        "inverse-primary":     "#4ae176",
        "primary-fixed":       "#6bff8f",
        "primary-fixed-dim":   "#4ae176",
        "on-primary-fixed":    "#002109",
        "on-primary-fixed-variant": "#005321",

        // Secondary (Bright Green)
        "secondary":            "#016e21",
        "on-secondary":         "#ffffff",
        "secondary-container":  "#99f899",
        "on-secondary-container":"#0f7427",
        "secondary-fixed":      "#99f899",
        "secondary-fixed-dim":  "#7edb7f",
        "on-secondary-fixed":   "#002105",
        "on-secondary-fixed-variant": "#005316",

        // Tertiary (Warm Red/Coral)
        "tertiary":             "#9e4036",
        "on-tertiary":          "#ffffff",
        "tertiary-container":   "#ff8b7c",
        "on-tertiary-container":"#76231b",
        "tertiary-fixed":       "#ffdad5",
        "tertiary-fixed-dim":   "#ffb4a9",
        "on-tertiary-fixed":    "#410001",
        "on-tertiary-fixed-variant": "#7f2a21",

        // Outlines
        "outline":         "#6d7b6c",
        "outline-variant": "#bccbb9",

        // Error
        "error":             "#ba1a1a",
        "on-error":          "#ffffff",
        "error-container":   "#ffdad6",
        "on-error-container":"#93000a",
      },

      // ── Border Radius ──
      borderRadius: {
        sm:      "0.25rem",
        DEFAULT: "0.5rem",
        md:      "0.75rem",
        lg:      "1rem",
        xl:      "1.5rem",
        full:    "9999px",
      },

      // ── Spacing (8px linear scale) ──
      spacing: {
        xs:   "4px",
        sm:   "8px",
        md:   "16px",
        lg:   "24px",
        xl:   "32px",
        xxl:  "48px",
        huge: "64px",
      },

      // ── Font Family (Manrope throughout) ──
      fontFamily: {
        sans:      ["Manrope", "system-ui", "sans-serif"],
        manrope:   ["Manrope", "system-ui", "sans-serif"],
        display:   ["Manrope", "system-ui", "sans-serif"],
        "body-lg": ["Manrope", "system-ui", "sans-serif"],
        "body-md": ["Manrope", "system-ui", "sans-serif"],
        "body-sm": ["Manrope", "system-ui", "sans-serif"],
        "h1":      ["Manrope", "system-ui", "sans-serif"],
        "h2":      ["Manrope", "system-ui", "sans-serif"],
        "h3":      ["Manrope", "system-ui", "sans-serif"],
        "label-md":["Manrope", "system-ui", "sans-serif"],
        "label-sm":["Manrope", "system-ui", "sans-serif"],
      },

      // ── Font Sizes with line-height, letter-spacing, weight ──
      fontSize: {
        "display":  ["48px", { lineHeight: "1.1",  letterSpacing: "-0.02em", fontWeight: "800" }],
        "h1":       ["32px", { lineHeight: "1.2",  letterSpacing: "-0.01em", fontWeight: "700" }],
        "h2":       ["24px", { lineHeight: "1.3",  fontWeight: "700" }],
        "h3":       ["20px", { lineHeight: "1.4",  fontWeight: "600" }],
        "body-lg":  ["18px", { lineHeight: "1.6",  fontWeight: "400" }],
        "body-md":  ["16px", { lineHeight: "1.5",  fontWeight: "400" }],
        "body-sm":  ["14px", { lineHeight: "1.5",  fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "1",    letterSpacing: "0.05em", fontWeight: "600" }],
        "label-sm": ["12px", { lineHeight: "1",    fontWeight: "600" }],
      },

      // ── Box Shadows (tonal/green-tinted) ──
      boxShadow: {
        soft:   "0 1px 3px rgba(34, 197, 94, 0.08), 0 1px 2px rgba(0,0,0,0.04)",
        medium: "0 4px 16px rgba(34, 197, 94, 0.10), 0 2px 6px rgba(0,0,0,0.06)",
        card:   "0 0 0 1px #bccbb9, 0 2px 8px rgba(34,197,94,0.05)",
      },
    },
  },
  plugins: [],
}
