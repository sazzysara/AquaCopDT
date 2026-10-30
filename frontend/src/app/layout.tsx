import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "../components/ThemeContext";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AquaCop | Satellite Waterbody Sentinel & Encroachment Response",
  description:
    "AI-powered satellite surveillance for coastal waterbodies, illegal construction intrusion detection, flood disaster prevention, and citizen governance.",
  icons: {
    icon: "/aquacop-logo.jpg",
    shortcut: "/aquacop-logo.jpg",
    apple: "/aquacop-logo.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/aquacop-logo.jpg" type="image/jpeg" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
      </head>
      <body className={`${plusJakartaSans.className} min-h-screen antialiased selection:bg-[#00A67E] selection:text-white`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
