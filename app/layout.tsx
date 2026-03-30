import type { Metadata } from "next";
import { Noto_Sans_KR, Manrope, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

const notoSansKR = Noto_Sans_KR({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const manrope = Manrope({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sleep Coach",
  description: "수면 사이클에 맞춰 개운하게 일어나세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSansKR.variable} ${manrope.variable} ${plusJakarta.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <LanguageProvider>
          {children}
        </LanguageProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
