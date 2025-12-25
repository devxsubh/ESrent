'use client'
import { useState, useEffect, useMemo } from 'react';
import { Car, PopulatedCategory } from '@/types/car';
import { Category } from '@/types/category';
import { Button } from "@/components/ui/button";
import { FilterModal, FilterValues } from './FilterModal';
import { CarCard } from '@/components/car/CarCard';
import { motion } from "framer-motion";
import { EmptyCars } from '@/components/ui/empty-state';
import { Loader2 } from 'lucide-react';

interface FeaturedVehiclesProps {
  cars: Car[];
  categories: Category[];
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

export function FeaturedVehicles({ cars, categories, hasMore = false, isLoadingMore = false, onLoadMore }: FeaturedVehiclesProps) {
  const [isClient, setIsClient] = useState(false);
  const [showAll, setShowAll] = useState(false); // NEW: controls whether to show all cars
  
  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const initialFilters: FilterValues = {
    types: [] as string[],
    tags: [] as string[],
    transmission: '',
    maxPrice: 10000,
  };

  // Filter out invalid cars before processing
  const validCars = cars.filter(car => 
    car && 
    car.id && 
    car.name && 
    car.brand && 
    car.model &&
    typeof (car.discountedPrice || car.originalPrice) === 'number' &&
    (car.discountedPrice || car.originalPrice || 0) > 0
  );

  // NEW: Sort cars so featured come first, then the rest
  const sortedCars = useMemo(() => {
    const featured = validCars.filter(car => car.featured);
    const nonFeatured = validCars.filter(car => !car.featured);
    return [...featured, ...nonFeatured];
  }, [validCars]);

  const [filteredCars, setFilteredCars] = useState<Car[]>(validCars);
  const [selectedFilters, setSelectedFilters] = useState(initialFilters);
  const [shouldResetFilters, setShouldResetFilters] = useState(false);

  // Build lookup maps
  const carTypeMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.filter((c: any) => c.type === 'carType').forEach((c: any) => { if (c.id) map[c.id] = c.name; });
    return map;
  }, [categories]);
  const transmissionMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.filter((c: any) => c.type === 'transmission').forEach((c: any) => { if (c.id) map[c.id] = c.name; });
    return map;
  }, [categories]);
  const fuelTypeMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.filter((c: any) => c.type === 'fuelType').forEach((c: any) => { if (c.id) map[c.id] = c.name; });
    return map;
  }, [categories]);
  const tagMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.filter((c: any) => c.type === 'tag').forEach((c: any) => { if (c.id) map[c.id] = c.name; });
    return map;
  }, [categories]);

  // Helper function to extract ID from string or PopulatedCategory
  const getId = (item: string | PopulatedCategory | undefined): string => {
    if (!item) return '';
    return typeof item === 'string' ? item : item.id || '';
  };

  const handleFiltersChange = (filters: FilterValues) => {
    setShouldResetFilters(false);
    setSelectedFilters(filters);

    // Map filter names to IDs using categories
    const typeIds = categories
      .filter((c) => c.type === 'carType' && filters.types.includes(c.name.toLowerCase()))
      .map((c) => c.id)
      .filter((id): id is string => !!id);
    const tagIds = categories
      .filter((c) => c.type === 'tag' && filters.tags.includes(c.name.toLowerCase()))
      .map((c) => c.id)
      .filter((id): id is string => !!id);
    const transmissionId = categories.find(
      (c) => c.type === 'transmission' && c.name.toLowerCase() === filters.transmission
    )?.id;

    const filtered = validCars.filter(car => {
      // Filter by price
      const matchesPrice = (car.discountedPrice || car.originalPrice || 0) >= 1000 && (car.discountedPrice || car.originalPrice || 0) <= filters.maxPrice;
      const matchesTransmission = !filters.transmission ||
        (Array.isArray(car.transmissionIds) && transmissionId && car.transmissionIds.some(id => getId(id) === transmissionId));
      const matchesType = typeIds.length === 0 ||
        (Array.isArray(car.carTypeIds) && car.carTypeIds.some((id) => typeIds.includes(getId(id))));
      const matchesTags = tagIds.length === 0 ||
        (Array.isArray(car.tagIds) && car.tagIds.some((id) => tagIds.includes(getId(id))));
      return matchesPrice && matchesTransmission && matchesType && matchesTags;
    });
    setFilteredCars(filtered);
  };

  const clearFilters = () => {
    setShouldResetFilters(true);
    setSelectedFilters(initialFilters);
    setFilteredCars(validCars);
  };

  const hasActiveFilters = selectedFilters.types.length > 0 || 
    selectedFilters.tags.length > 0 || 
    selectedFilters.transmission !== '' || 
    selectedFilters.maxPrice < 10000;

  // Don't render if no valid cars
  if (validCars.length === 0) {
    return (
      <motion.section
        className="mt-8 px-4 sm:px-6 pb-8"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-heading-3">Featured Vehicles</h2>
        </div>
        <EmptyCars />
      </motion.section>
    );
  }

  // Determine how many cars to show
  const carsToShow = showAll ? filteredCars.length : Math.min(6, filteredCars.length);
  const showViewAll = !showAll && filteredCars.length > 6;
  const showShowLess = showAll && filteredCars.length > 6;

  return (
    <motion.section
      className="mt-8 px-4 sm:px-6 pb-8"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-heading-3">Featured Vehicles</h2>
        <div className="flex items-center gap-4">
          <FilterModal onFiltersChange={handleFiltersChange} shouldReset={shouldResetFilters} categories={categories} />
        </div>
      </div>
      {/* Selected Filters Display */}
      {hasActiveFilters && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {selectedFilters.types.map((type, index) => (
            <span
              key={`type-${index}-${type}`}
              className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
          ))}
          {selectedFilters.tags.map((tag, index) => (
            <span
              key={`tag-${index}-${tag}`}
              className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
            >
              {tag.charAt(0).toUpperCase() + tag.slice(1)}
            </span>
          ))}
          {selectedFilters.transmission && (
            <span
              className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
            >
              {selectedFilters.transmission.charAt(0).toUpperCase() + selectedFilters.transmission.slice(1)}
            </span>
          )}
          {selectedFilters.maxPrice < 10000 && (
            <span
              className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
            >
              Up to ${selectedFilters.maxPrice.toLocaleString()}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-primary"
          >
            Clear All
          </Button>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedCars
          .filter(car => filteredCars.includes(car))
          .slice(0, carsToShow)
          .map((car) => (
            <CarCard
              key={car.id}
              car={car}
              carTypeNames={(car.carTypeIds || []).map((id) => carTypeMap[getId(id)]).filter(Boolean)}
              transmissionNames={(car.transmissionIds || []).map((id) => transmissionMap[getId(id)]).filter(Boolean)}
              fuelTypeNames={(car.fuelTypeIds || []).map((id) => fuelTypeMap[getId(id)]).filter(Boolean)}
              tagNames={(car.tagIds || []).map((id) => tagMap[getId(id)]).filter(Boolean)}
              onClick={() => {
                if (isClient && typeof window !== 'undefined') {
                  localStorage.setItem('previousPage', 'home');
                }
              }}
            />
          ))}
      </div>
      {filteredCars.length === 0 && hasActiveFilters && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No vehicles match your current filters.</p>
          <Button
            variant="outline"
            onClick={clearFilters}
            className="mt-4"
          >
            Clear Filters
          </Button>
        </div>
      )}
      {/* View All / Show Less Button */}
      {(showViewAll || showShowLess) && (
        <div className="flex justify-center mt-8">
          <Button onClick={() => setShowAll(!showAll)}>
            {showAll ? 'Show Less' : 'View All'}
          </Button>
        </div>
      )}
      
      {/* Load More Button for Pagination */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center mt-8">
          <Button 
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="bg-[#44caad] hover:bg-[#3ab89a] text-white min-w-[140px]"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
      
      {/* Loading indicator when loading more */}
      {isLoadingMore && (
        <div className="flex justify-center mt-4">
          <p className="text-sm text-gray-400">Loading more vehicles...</p>
        </div>
      )}
    </motion.section>
  );
}
