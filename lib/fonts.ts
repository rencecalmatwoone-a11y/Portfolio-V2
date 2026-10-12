import localFont from "next/font/local";

export const plusJakartaSans = localFont({
  src: "./font-assets/PlusJakartaSans-Variable.ttf",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-plus-jakarta-sans",
});

export const inter = localFont({
  src: "./font-assets/Inter-Variable.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-inter",
});
