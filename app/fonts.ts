import localFont from "next/font/local";

// Self-hosted (no Google Fonts request at runtime): faster on mobile data
// and builds work offline. Files come from the @fontsource packages.

export const serif = localFont({
  src: [
    {
      path: "../node_modules/@fontsource-variable/cormorant-garamond/files/cormorant-garamond-latin-wght-normal.woff2",
      style: "normal",
    },
    {
      path: "../node_modules/@fontsource-variable/cormorant-garamond/files/cormorant-garamond-latin-wght-italic.woff2",
      style: "italic",
    },
  ],
  weight: "300 700",
  variable: "--font-serif",
  display: "swap",
});

export const script = localFont({
  src: "../node_modules/@fontsource/great-vibes/files/great-vibes-latin-400-normal.woff2",
  weight: "400",
  variable: "--font-script",
  display: "swap",
});

export const sans = localFont({
  src: "../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-sans",
  display: "swap",
});
