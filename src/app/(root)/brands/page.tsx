'use client';

import { useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Brand } from '@/types/brand';
import { BrandsPageSkeleton } from '@/components/ui/card-skeleton';
import { Header } from '../home/components/Header';
import { useBrands } from '@/hooks/useApi';

export default function BrandsPage() {
  const { data: brandsData, loading: brandsLoading } = useBrands({ limit: 100 });
  
  const brands = useMemo(() => brandsData?.data || [], [brandsData]);
  const loading = brandsLoading;

  useEffect(() => {
    brands.forEach(brand => {
      // console.log('Brand:', brand.name, 'ID:', brand.id);
    });
  }, [brands]);

  if (loading) {
    return <BrandsPageSkeleton />;
  }

  return (
    <div className="flex flex-col min-h-screen max-w-7xl mx-auto w-full">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full p-4">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="heading-4 font-semibold mb-2">All Brands</h1>
          <p className="text-muted-foreground">
            Discover our collection of luxury car brands
          </p>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {(brands as unknown as Brand[]).map((brand) => (
            <Link
              key={brand.id}
              href={`/brand/${encodeURIComponent(brand.id)}`}
              className="group relative overflow-hidden rounded-xl bg-card border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-primary/20"
            >
              <div className="p-6 flex flex-col items-center justify-center min-h-[120px]">
                {/* Brand Logo */}
                <div className="w-16 h-16 relative mb-3 group-hover:scale-110 transition-transform duration-300">
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  fill
                    className="object-contain rounded-lg"
                />
                </div>
                
                {/* Brand Name */}
                <span className="text-sm font-medium text-center text-foreground group-hover:text-primary transition-colors duration-300">
                  {brand.name}
                </span>
                
                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {brands.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No Brands Found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              We're working on adding more luxury car brands to our collection. Check back soon!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
