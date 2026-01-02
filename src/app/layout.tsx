import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Instrument_Sans } from "next/font/google";
import "../app/globals.css";
import cn from "classnames";
// import CrispChat from "@/components/CrispChat";
import { AuthProvider } from '@/hooks/useAuthContext';
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider';
import { GoogleAnalytics } from '@next/third-parties/google';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "ES Rentals - Luxury Car Rental in Dubai",
  description: "Find the best cars for rent in Dubai. Explore our wide range of luxury vehicles and book your dream car today.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-clash antialiased",
          "selection:bg-primary selection:text-primary-foreground",
          "flex flex-col",
          inter.variable,
          instrumentSans.variable,
          "font-sans"
        )}
      >
        <ReactQueryProvider>
          <AuthProvider>
            <main className="flex-1">
              {children}
            </main>
          </AuthProvider>
        </ReactQueryProvider>
        {/* <CrispChat /> */}
        <GoogleAnalytics gaId="G-2SZ915LWJ5" />
      </body>
    </html>
  );
}
