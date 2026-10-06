import localFont from "next/font/local";

export const geist = localFont({
  src: "./font-assets/Geist-Variable.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-geist",
});

export const plusJakartaSans = localFont({
  src: "./font-assets/PlusJakartaSans-Variable.ttf",
  weight: "200 800",
  style: "normal",
  display: "swap",
  variable: "--font-plus-jakarta-sans",
});
