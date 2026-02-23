import type { Metadata } from "next";
import Script from "next/script";
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
        {/* Meta Pixel Code */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1622803045742738');
fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1622803045742738&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}
      </body>
    </html>
  );
}
