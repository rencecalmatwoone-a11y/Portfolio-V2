import localFont from "next/font/local";

export const geist = localFont({
  src: "./font-assets/Geist-Variable.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-geist",
});

export const inter = localFont({
  src: "./font-assets/Inter-Variable.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-inter",
});
