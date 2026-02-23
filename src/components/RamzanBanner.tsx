'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
} from '@/components/ui/dialog';
import { Sparkles, Gift, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const POPUP_STORAGE_KEY = 'esrent_ramzan_popup_seen_2026';
const DEFAULT_MARQUEE = '50% off Ramzan Special 2026';
const POPUP_DELAY_MS = 15000; // Show after 15 seconds

export function RamzanBanner() {
  const [marqueeText, setMarqueeText] = useState(DEFAULT_MARQUEE);
  const [popupOpen, setPopupOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Optional: fetch promo from coupon description (Ramzan/Ramadan)
  useEffect(() => {
    setMounted(true);
    fetch('/api/coupons/available')
      .then((res) => res.json())
      .then((result) => {
        if (!result?.success || !Array.isArray(result.data)) return;
        const ramzanCoupon = result.data.find(
          (c: { description?: string }) =>
            c.description && /ramazan|ramzan|ramadan/i.test(c.description)
        );
        if (ramzanCoupon?.description) {
          const d = ramzanCoupon.description.trim();
          setMarqueeText(d.includes('2026') ? d : `${d} 2026`);
        }
      })
      .catch(() => {});
  }, []);

  // Show popup after a delay, once per session
  useEffect(() => {
    if (!mounted) return;
    try {
      const seen = sessionStorage.getItem(POPUP_STORAGE_KEY);
      if (seen) return;
      const t = setTimeout(() => {
        setPopupOpen(true);
        sessionStorage.setItem(POPUP_STORAGE_KEY, '1');
      }, POPUP_DELAY_MS);
      return () => clearTimeout(t);
    } catch {
      const t = setTimeout(() => setPopupOpen(true), POPUP_DELAY_MS);
      return () => clearTimeout(t);
    }
  }, [mounted]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <>
      {/* Top marquee */}
      <div
        className="relative w-full overflow-hidden bg-primary text-primary-foreground py-2 text-sm font-semibold"
        aria-live="polite"
      >
        <div className="flex animate-marquee whitespace-nowrap">
          <span className="inline-flex items-center gap-2 mr-8">
            <Sparkles className="w-4 h-4 shrink-0" aria-hidden />
            {marqueeText}
          </span>
          <span className="inline-flex items-center gap-2 mr-8">
            <Sparkles className="w-4 h-4 shrink-0" aria-hidden />
            {marqueeText}
          </span>
          <span className="inline-flex items-center gap-2 mr-8">
            <Sparkles className="w-4 h-4 shrink-0" aria-hidden />
            {marqueeText}
          </span>
        </div>
      </div>

      {/* Pop-up modal — responsive two-panel card, appears after 15s with smooth animation */}
      <Dialog open={popupOpen} onOpenChange={setPopupOpen}>
        <DialogContent
          className="p-0 gap-0 w-[calc(100vw-2rem)] max-w-3xl max-h-[90vh] overflow-hidden border-border/50 rounded-xl sm:rounded-2xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 [&>button]:absolute [&>button]:right-3 [&>button]:top-3 [&>button]:z-20 [&>button]:flex [&>button]:h-9 [&>button]:w-9 [&>button]:shrink-0 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-lg [&>button]:bg-black/50 [&>button]:text-white [&>button]:border [&>button]:border-white/20 [&>button]:hover:bg-black/70 [&>button]:focus:outline-none [&>button]:focus:ring-2 [&>button]:focus:ring-white/30 [&>button]:transition-colors"
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">50% off Ramzan Special</DialogTitle>
          <div className="grid grid-cols-1 sm:grid-cols-[0.9fr_1.1fr] min-h-0 max-h-[90vh] overflow-y-auto">
            {/* Left panel — image (responsive aspect, doesn't dominate on mobile) */}
            <div className="relative w-full aspect-[4/3] sm:aspect-auto sm:min-h-[280px] sm:max-h-[70vh] bg-muted shrink-0">
              <Image
                src="https://res.cloudinary.com/dmlej5fc2/image/upload/v1755941110/temp-1755941107731/kfzpazepfy9hn0ge0svu.jpg"
                alt="Luxury car rental"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 360px"
                priority={false}
              />
            </div>

            {/* Right panel — dark content (scrollable on small screens) */}
            <div className="flex flex-col bg-secondary text-secondary-foreground p-4 sm:p-6 md:p-8 justify-center min-h-0 overflow-y-auto">
              <div className="flex flex-col items-center text-center sm:block sm:text-left">
                <div className="flex justify-center sm:justify-start mb-3 sm:mb-4">
                  <div className="rounded-full bg-primary/20 p-2 sm:p-2.5">
                    <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-primary" aria-hidden />
                  </div>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-white mb-1.5 sm:mb-2 font-serif">
                  50% off Ramzan Special
                </h2>
                <p className="text-xs sm:text-sm text-white/80 mb-4 sm:mb-6 max-w-sm">
                  Join our community and be the first to know about exclusive offers, new arrivals, and the best rates for luxury car rentals in Dubai.
                </p>
              </div>

              {!subscribed ? (
                <form onSubmit={handleSubscribe} className="space-y-3 sm:space-y-4">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-background/90 border-white/30 text-foreground placeholder:text-muted-foreground rounded-lg h-10 sm:h-11 text-sm sm:text-base"
                    required
                  />
                  <Button
                    type="submit"
                    className="w-full h-10 sm:h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg gap-2 text-sm sm:text-base"
                  >
                    Subscribe
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </Button>
                </form>
              ) : (
                <p className="text-sm text-primary font-medium">Thanks! Check your email for the offer.</p>
              )}

              <p className="text-[11px] sm:text-xs text-white/60 mt-3 sm:mt-4 text-center sm:text-left">
                By subscribing, you agree to our{' '}
                <Link href="/privacy-policy" className="underline hover:text-white/90" onClick={() => setPopupOpen(false)}>
                  Privacy Policy
                </Link>
                . Unsubscribe anytime.
              </p>
              <DialogClose asChild>
                <button
                  type="button"
                  className="mt-2 sm:mt-3 text-xs sm:text-sm text-white/70 hover:text-white underline cursor-pointer"
                >
                  No thanks, I&apos;ll pay full price
                </button>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
