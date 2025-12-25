'use client'

import { Suspense, Component, ReactNode, useMemo, useState, useEffect, useCallback } from "react"


import { FeaturedBrands } from "./components/FeaturedBrands"
import { Categories } from "./components/Categories"
import { FeaturedVehicles } from "./components/FeaturedVehicles"
import TestimonialsSection from "./components/TestimonialsSection";
import VideoTestimonialsSection from "./components/VideoTestimonialsSection";
import { FaWhatsapp } from "react-icons/fa";
import { HeroSection } from "./components/HeroSection";
import DemoOne from '@/components/ui/demo';
import { ErrorState, EmptyCars, EmptyBrands, EmptyCategories } from '@/components/ui/empty-state';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from "./components/Header"
import { Brand } from '@/types/brand';
import { Car } from '@/types/car';
import { Category } from '@/types/category';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-4">
          <p className="heading-4 text-red-500">Something went wrong:</p>
          <pre className="body-2">{this.state.error?.message}</pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}



// Import API hooks
import { useCars, useBrands, useCategories } from '@/hooks/useApi';

function LandingSkeleton() {
  return (
    <div className="space-y-12">
      {/* Hero skeleton */}
      <div className="relative w-full overflow-hidden">
        <Card className="w-full h-72 sm:h-96 md:h-[28rem] bg-gray-800/60 border-gray-700">
          <div className="w-full h-full">
            <Skeleton className="w-full h-full bg-gray-700" />
          </div>
          <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end gap-3 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
            <Skeleton className="h-8 w-3/4 sm:w-1/2 bg-gray-600" />
            <Skeleton className="h-4 w-2/3 sm:w-1/3 bg-gray-600" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-10 w-28 bg-gray-600" />
              <Skeleton className="h-10 w-28 bg-gray-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Featured Brands section title */}
      <div className="px-1">
        <Skeleton className="h-6 w-40 bg-gray-700 mb-3" />
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[...Array(8)].map((_, i) => (
            <Card key={`brand-skel-${i}`} className="w-40 h-24 flex-shrink-0 flex items-center justify-center bg-gray-800/60 border-gray-700">
              <Skeleton className="w-16 h-16 rounded-full bg-gray-700" />
            </Card>
          ))}
        </div>
      </div>

      {/* Featured Vehicles section title */}
      <div className="px-1">
        <Skeleton className="h-6 w-48 bg-gray-700 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <Card key={`car-skel-${i}`} className="h-72 bg-gray-800/60 border-gray-700 flex flex-col">
              <div className="relative">
                <Skeleton className="h-44 w-full rounded-t-xl bg-gray-700" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full bg-gray-600" />
                  <Skeleton className="h-6 w-20 rounded-full bg-gray-600" />
                </div>
              </div>
              <div className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4 bg-gray-700" />
                <div className="flex gap-3">
                  <Skeleton className="h-4 w-16 bg-gray-700" />
                  <Skeleton className="h-4 w-16 bg-gray-700" />
                  <Skeleton className="h-4 w-20 bg-gray-700" />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <Skeleton className="h-5 w-24 bg-gray-700" />
                  <Skeleton className="h-9 w-24 bg-gray-700" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Categories section title */}
      <div className="px-1">
        <Skeleton className="h-6 w-40 bg-gray-700 mb-3" />
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[...Array(12)].map((_, i) => (
            <Skeleton key={`cat-chip-${i}`} className="h-9 w-28 rounded-full bg-gray-700" />
          ))}
        </div>
      </div>

      {/* Video Testimonials heading & cards */}
      <div className="px-1">
        <Skeleton className="h-6 w-48 bg-gray-700 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={`video-testi-skel-${i}`} className="overflow-hidden bg-gray-800/60 border-gray-700">
              <Skeleton className="aspect-video w-full bg-gray-700" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-3 w-full bg-gray-700" />
                <Skeleton className="h-3 w-3/4 bg-gray-700" />
                <Skeleton className="h-3 w-1/2 bg-gray-700" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Testimonials heading & cards */}
      <div className="px-1">
        <Skeleton className="h-6 w-48 bg-gray-700 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={`testi-skel-${i}`} className="h-48 bg-gray-800/60 border-gray-700 p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/2 bg-gray-700" />
                  <Skeleton className="h-4 w-3/4 bg-gray-700" />
                  <Skeleton className="h-4 w-2/3 bg-gray-700" />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Skeleton className="h-4 w-14 bg-gray-700" />
                <Skeleton className="h-4 w-20 bg-gray-700" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeaturedContent() {
  // Pagination state for cars
  const [currentPage, setCurrentPage] = useState(1);
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [hasMoreCars, setHasMoreCars] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const CARS_PER_PAGE = 30;

  // Memoize the API parameters to prevent unnecessary re-renders
  const carsParams = useMemo(() => ({ 
    page: currentPage, 
    limit: CARS_PER_PAGE 
  }), [currentPage]);
  const brandsParams = useMemo(() => ({ featured: true, limit: 10 }), []);
  const categoriesParams = useMemo(() => ({}), []);

  // Use API hooks for data fetching with caching
  // Note: These hooks execute in parallel - React will trigger all useEffect hooks simultaneously
  // Each hook independently fetches data without blocking others
  const { 
    data: carsData, 
    loading: carsLoading, 
    error: carsError,
    refetch: refetchCars 
  } = useCars(carsParams);
  
  const { 
    data: brandsData, 
    loading: brandsLoading, 
    error: brandsError,
    refetch: refetchBrands 
  } = useBrands(brandsParams);
  
  const { 
    data: categoriesData, 
    loading: categoriesLoading, 
    error: categoriesError,
    refetch: refetchCategories 
  } = useCategories(categoriesParams);

  // Accumulate cars as pages are loaded
  useEffect(() => {
    if (carsData?.data) {
      const newCars = (carsData.data as unknown as Car[]) || [];
      const totalCars = (carsData as { total?: number }).total;
      
      if (currentPage === 1) {
        // First page - replace all cars
        setAllCars(newCars);
        // Check if there are more cars to load
        // If we got a full page and total exists, check against total
        // Otherwise, if we got a full page, assume there might be more
        if (totalCars !== undefined) {
          setHasMoreCars(newCars.length < totalCars);
        } else {
          setHasMoreCars(newCars.length === CARS_PER_PAGE);
        }
      } else {
        // Subsequent pages - append new cars (avoid duplicates)
        setAllCars(prev => {
          const existingIds = new Set(prev.map(car => car.id));
          const uniqueNewCars = newCars.filter(car => !existingIds.has(car.id));
          const updatedCars = [...prev, ...uniqueNewCars];
          
          // Check if there are more cars to load
          if (totalCars !== undefined) {
            setHasMoreCars(updatedCars.length < totalCars);
          } else {
            // If no total, assume more if we got a full page
            setHasMoreCars(newCars.length === CARS_PER_PAGE);
          }
          
          return updatedCars;
        });
      }
      setIsLoadingMore(false);
    }
  }, [carsData, currentPage, CARS_PER_PAGE]);

  // Memoize the extracted data to prevent unnecessary re-renders
  const cars = useMemo(() => allCars, [allCars]);
  const brands = useMemo(() => brandsData?.data || [], [brandsData]);
  const categories = useMemo(() => categoriesData?.data || [], [categoriesData]);

  // Load more cars handler
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMoreCars) {
      setIsLoadingMore(true);
      setCurrentPage(prev => prev + 1);
    }
  }, [isLoadingMore, hasMoreCars]);

  // Check for errors
  const errors = [carsError, brandsError, categoriesError].filter(Boolean);
  const hasErrors = errors.length > 0;

  // Filter out any invalid data
  const validCars = useMemo(() => 
    cars.filter(car => car && car.id && car.name), 
    [cars]
  );
  const validBrands = useMemo(() => {
    const seen = new Set();
    return brands.filter(brand => {
      if (!brand || !brand.id || !brand.name || !brand.logo) return false;
      if (seen.has(brand.id)) return false;
      seen.add(brand.id);
      return true;
    });
  }, [brands]);
  const validCategories = useMemo(() => 
    categories.filter(category => category && category.name), 
    [categories]
  );

  // Handle retry for all data
  const handleRetry = () => {
    refetchCars();
    refetchBrands();
    refetchCategories();
  };

  if (hasErrors) {
    return (
      <ErrorState 
        error={errors.join(', ')} 
        onRetry={handleRetry}
      />
    );
  }

  return (
    <>
      {/* Featured Brands Section */}
      {brandsLoading ? (
        <div className="px-1">
          <Skeleton className="h-6 w-40 bg-gray-700 mb-3" />
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[...Array(8)].map((_, i) => (
              <Card key={`brand-skel-${i}`} className="w-40 h-24 flex-shrink-0 flex items-center justify-center bg-gray-800/60 border-gray-700">
                <Skeleton className="w-16 h-16 rounded-full bg-gray-700" />
              </Card>
            ))}
          </div>
        </div>
      ) : validBrands.length > 0 ? (
        <FeaturedBrands brands={validBrands as unknown as Brand[]} />
      ) : (
        <div className="mt-8 px-4 sm:px-6 pb-8">
          <EmptyBrands />
        </div>
      )}
      
      {/* Featured Vehicles Section */}
      {carsLoading ? (
        <div className="px-1">
          <Skeleton className="h-6 w-48 bg-gray-700 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <Card key={`car-skel-${i}`} className="h-72 bg-gray-800/60 border-gray-700 flex flex-col">
                <div className="relative">
                  <Skeleton className="h-44 w-full rounded-t-xl bg-gray-700" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full bg-gray-600" />
                    <Skeleton className="h-6 w-20 rounded-full bg-gray-600" />
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <Skeleton className="h-6 w-3/4 bg-gray-700" />
                  <div className="flex gap-3">
                    <Skeleton className="h-4 w-16 bg-gray-700" />
                    <Skeleton className="h-4 w-16 bg-gray-700" />
                    <Skeleton className="h-4 w-20 bg-gray-700" />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <Skeleton className="h-5 w-24 bg-gray-700" />
                    <Skeleton className="h-9 w-24 bg-gray-700" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : validCars.length > 0 ? (
        <FeaturedVehicles 
          cars={validCars as unknown as Car[]} 
          categories={validCategories as unknown as Category[]}
          hasMore={hasMoreCars}
          isLoadingMore={isLoadingMore || (carsLoading && currentPage > 1)}
          onLoadMore={handleLoadMore}
        />
      ) : (
        <div className="mt-8 px-4 sm:px-6 pb-8">
          <EmptyCars />
        </div>
      )}
      
      <DemoOne />
      
      {/* Categories Section */}
      {categoriesLoading ? (
        <div className="px-1">
          <Skeleton className="h-6 w-40 bg-gray-700 mb-3" />
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[...Array(12)].map((_, i) => (
              <Skeleton key={`cat-chip-${i}`} className="h-9 w-28 rounded-full bg-gray-700" />
            ))}
          </div>
        </div>
      ) : validCategories.length > 0 ? (
        <Categories categories={validCategories as unknown as Category[]} />
      ) : (
        <div className="mt-8 px-4 sm:px-6 pb-8">
          <EmptyCategories />
        </div>
      )}
      
      <VideoTestimonialsSection limit={10} featuredOnly={true} />
      
      <TestimonialsSection />
    </>
  );
}

function WhatsAppFAB() {
      const whatsappNumber = "971553553626"; // +971 55 355 3626
  const message = "Hi, I'm interested in renting a car"; // Default message
  
  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-12 right-12 sm:right-12 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 ease-in-out z-50"
      aria-label="Chat on WhatsApp"
    >
      <FaWhatsapp className="w-6 h-6" />
    </button>
  );
}

export default function HomeScreen() {
  return (
    <div className="flex flex-col min-h-screen relative">
      <Header />
      <div className="relative z-0">
        <HeroSection />
        <main className="flex-1 max-w-7xl mx-auto w-full p-4">
          <ErrorBoundary>
            <Suspense fallback={<LandingSkeleton />}>
              <FeaturedContent />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
      <WhatsAppFAB />
    </div>
  );
}
