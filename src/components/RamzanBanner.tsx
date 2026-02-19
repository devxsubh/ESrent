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
const POPUP_DELAY_MS = 2500; // Show after 2.5 seconds

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

      {/* Pop-up modal — two-panel card, appears after delay with smooth animation */}
      <Dialog open={popupOpen} onOpenChange={setPopupOpen}>
        <DialogContent
          className="p-0 gap-0 w-[95vw] max-w-3xl overflow-hidden border-border/50 rounded-2xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 [&>button]:right-3 [&>button]:top-3 [&>button]:h-9 [&>button]:w-9 [&>button]:rounded-lg [&>button]:bg-secondary [&>button]:text-white [&>button]:border [&>button]:border-white/20 [&>button]:hover:bg-secondary/80 [&>button]:z-10"
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">50% off Ramzan Special</DialogTitle>
          <div className="grid grid-cols-1 sm:grid-cols-[0.9fr_1.1fr] min-h-[320px]">
            {/* Left panel — image */}
            <div className="relative aspect-[3/4] sm:aspect-auto sm:min-h-[360px] bg-muted">
              <Image
                src="https://res.cloudinary.com/dmlej5fc2/image/upload/v1755941110/temp-1755941107731/kfzpazepfy9hn0ge0svu.jpg"
                alt="Luxury car rental"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 340px"
                priority={false}
              />
            </div>

            {/* Right panel — dark content */}
            <div className="flex flex-col bg-secondary text-secondary-foreground p-6 sm:p-8 justify-center">
              <div className="flex flex-col items-center text-center sm:block sm:text-left">
                <div className="flex justify-center sm:justify-start mb-4">
                  <div className="rounded-full bg-primary/20 p-2.5">
                    <Gift className="w-6 h-6 text-primary" aria-hidden />
                  </div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2 font-serif">
                  50% off Ramzan Special
                </h2>
                <p className="text-sm text-white/80 mb-6 max-w-sm">
                  Join our community and be the first to know about exclusive offers, new arrivals, and the best rates for luxury car rentals in Dubai.
                </p>
              </div>

              {!subscribed ? (
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background/90 border-white/30 text-foreground placeholder:text-muted-foreground rounded-lg h-11"
                    required
                  />
                  <Button
                    type="submit"
                    className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg gap-2"
                  >
                    Subscribe
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>
              ) : (
                <p className="text-sm text-primary font-medium">Thanks! Check your email for the offer.</p>
              )}

              <p className="text-xs text-white/60 mt-4 text-center sm:text-left">
                By subscribing, you agree to our{' '}
                <Link href="/privacy-policy" className="underline hover:text-white/90" onClick={() => setPopupOpen(false)}>
                  Privacy Policy
                </Link>
                . Unsubscribe anytime.
              </p>
              <DialogClose asChild>
                <button
                  type="button"
                  className="mt-3 text-sm text-white/70 hover:text-white underline cursor-pointer"
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
