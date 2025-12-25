'use client'

import { useEffect, useState, useMemo } from 'react'
import { Car, PopulatedCategory } from '@/types/car'
import { Header } from '../home/components/Header'
import { FilterModal, FilterValues } from '../home/components/FilterModal'
import { Button } from '@/components/ui/button'
import { SearchBar } from '../home/components/SearchBar'
import { Calendar } from 'lucide-react'
import { CarCard } from '@/components/car/CarCard'
import { format, addDays } from 'date-fns';
import { useCars } from '@/hooks/useApi';
import { useCategories } from '@/hooks/useApi';
import { HydrationSafe } from '@/components/ui/hydration-safe';

const ITEMS_PER_PAGE = 12

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredCars, setFilteredCars] = useState<Car[]>([])
  const [selectedFilters, setSelectedFilters] = useState<FilterValues>({
    types: [],
    tags: [],
    transmission: '',
    maxPrice: 10000000,
  })
  const [shouldResetFilters, setShouldResetFilters] = useState(false)
  
  // Car hire state
  const [pickupDate, setPickupDate] = useState('')
  const [dropoffDate, setDropoffDate] = useState('')
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize dates on client side only
  useEffect(() => {
    setPickupDate(format(new Date(), 'yyyy-MM-dd'))
    setDropoffDate(format(addDays(new Date(), 1), 'yyyy-MM-dd'))
  }, [])

  const durations = useMemo(() => [
    { label: 'Daily', value: 'daily', days: 1 },
    { label: '+3 Days', value: '3days', days: 3 },
    { label: 'Weekly', value: 'weekly', days: 7 },
  ], []);
  const [selectedDuration, setSelectedDuration] = useState('daily');

  // Update dropoffDate when pickupDate or duration changes
  useEffect(() => {
    if (!pickupDate) return; // Guard: only run if pickupDate is set
    const durationObj = durations.find(d => d.value === selectedDuration) || durations[0];
    const pickup = new Date(pickupDate);
    if (isNaN(pickup.getTime())) return; // Guard: only run if pickupDate is a valid date
    const newDropoff = format(addDays(pickup, durationObj.days), 'yyyy-MM-dd');
    setDropoffDate(newDropoff);
  }, [pickupDate, selectedDuration, durations]);

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Use API hook for cars
  const { data: carsData, loading: carsLoading } = useCars({ limit: 1000 });
  const { data: categoriesData, loading: categoriesLoading } = useCategories();
  const categories = useMemo(() => categoriesData?.data || [], [categoriesData]);

  // Helper function to extract ID from string or PopulatedCategory
  const getId = (item: string | PopulatedCategory): string => {
    return typeof item === 'string' ? item : item.id || '';
  };

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

  // Update cars when data changes
  useEffect(() => {
    if (carsData?.data) {
      const allCars: Car[] = carsData.data as unknown as Car[];
      setCars(allCars);
      setLoading(false);
    }
  }, [carsData]);

  // Filter cars by search query and filters
  useEffect(() => {
    let filtered = [...cars];
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(car =>
        car.name?.toLowerCase().includes(q) ||
        car.brand?.toLowerCase().includes(q) ||
        car.model?.toLowerCase().includes(q)
      );
    }
    // Apply other filters (types, tags, price, etc) as before
    if (selectedFilters.types.length > 0) {
      filtered = filtered.filter(car =>
        Array.isArray(car.carTypeIds) && car.carTypeIds.some(id => selectedFilters.types.includes(carTypeMap[getId(id)]?.toLowerCase()))
      );
    }
    if (selectedFilters.tags.length > 0) {
      filtered = filtered.filter(car =>
        Array.isArray(car.tagIds) && car.tagIds.some(id => selectedFilters.tags.includes(tagMap[getId(id)]?.toLowerCase()))
      );
    }
    // Filter by price
    filtered = filtered.filter(car => {
      const effectivePrice = car.discountedPrice || car.originalPrice || 0;
      return effectivePrice <= selectedFilters.maxPrice;
    });
    setFilteredCars(filtered);
    setCurrentPage(1); // Reset to first page on search/filter
  }, [cars, searchQuery, selectedFilters, carTypeMap, tagMap]);

  // Update loading state
  useEffect(() => {
    setLoading(carsLoading);
  }, [carsLoading]);

  const handleFiltersChange = (filters: FilterValues) => {
    setShouldResetFilters(false)
    setSelectedFilters(filters)
    setCurrentPage(1) // Reset to first page when filters change

    const filtered = cars.filter(car => {
      const matchesPrice = (car.discountedPrice || car.originalPrice || 0) >= 1000 && (car.discountedPrice || car.originalPrice || 0) <= filters.maxPrice;
      const matchesTransmission = !filters.transmission ||
        (Array.isArray(car.transmissionIds) && car.transmissionIds[0] && car.transmissionIds[0] === filters.transmission);
      const matchesCategory = filters.types.length === 0 ||
        (Array.isArray(car.carTypeIds) && car.carTypeIds[0] && filters.types.includes(carTypeMap[getId(car.carTypeIds[0])]?.toLowerCase()));
      // You may want to map IDs to names for a better UX
      return matchesPrice && matchesTransmission && matchesCategory;
    });

    setFilteredCars(filtered)
  }

  const clearFilters = () => {
    setShouldResetFilters(true)
    setSelectedFilters({
      types: [],
      tags: [],
      transmission: '',
      maxPrice: 10000000,
    })
    setFilteredCars(cars)
    setCurrentPage(1)
  }

  const totalPages = Math.ceil(filteredCars.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedCars = filteredCars.slice(startIndex, endIndex)

  const hasActiveFilters = selectedFilters.types.length > 0 || 
    selectedFilters.tags.length > 0 || 
    selectedFilters.transmission !== '' || 
    selectedFilters.maxPrice < 10000

  if (loading || categoriesLoading) {
    return (
      <div className="flex flex-col min-h-screen justify-center align-center max-w-7xl mx-auto">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full p-4">
          <div className="animate-pulse space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen  max-w-7xl mx-auto w-full">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search cars by name, brand, model..." />
        {/* Range Picker UI like home screen */}
        <HydrationSafe>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 w-full max-w-2xl">
            <div className="space-y-2">
              <label className="text-white text-sm font-medium">From</label>
              <div className="relative">
                <input
                  type="date"
                  value={pickupDate}
                  onChange={e => setPickupDate(e.target.value)}
                  min={pickupDate || format(new Date(), 'yyyy-MM-dd')}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white appearance-none"
                />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" size={20} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-white text-sm font-medium">Duration</label>
              <div className="flex gap-2">
                {durations.map((duration) => (
                  <button
                    key={duration.value}
                    onClick={() => setSelectedDuration(duration.value)}
                    className={`flex-1 px-4 py-3 rounded-lg transition-colors ${
                      selectedDuration === duration.value
                        ? 'bg-primary text-black'
                        : 'bg-black/50 text-white border border-white/10 hover:bg-black/70'
                    }`}
                  >
                    {duration.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </HydrationSafe>
        {/* Display selected dates */}
        {pickupDate && dropoffDate && (
          <div className="bg-secondary/50 rounded-lg p-4 my-4 flex items-center gap-4">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Selected dates for car hire</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(pickupDate)} - {formatDate(dropoffDate)}
              </p>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="heading-4 font-semibold">All Cars</h1>
          <div className="flex items-center gap-4">
            <FilterModal 
              onFiltersChange={handleFiltersChange} 
              shouldReset={shouldResetFilters} 
              categories={categories as any as import('@/types/category').Category[]}
            />
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {selectedFilters.types.map((type, index) => (
              <span
                key={`active-type-${index}-${type}`}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
            ))}
            {selectedFilters.transmission && (
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                {selectedFilters.transmission.charAt(0).toUpperCase() + selectedFilters.transmission.slice(1)}
              </span>
            )}
            {selectedFilters.maxPrice < 10000 && (
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
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

        {/* Cars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((car) => (
            <CarCard
              key={car.id}
              brandName={car.brand}
              seater={car.seater}
              car={car}
              carTypeNames={(car.carTypeIds || []).map((id) => carTypeMap[getId(id)]).filter(Boolean)}
              transmissionNames={(car.transmissionIds || []).map((id) => transmissionMap[getId(id)]).filter(Boolean)}
              fuelTypeNames={(car.fuelTypeIds || []).map((id) => fuelTypeMap[getId(id)]).filter(Boolean)}
              tagNames={(car.tagIds || []).map((id) => tagMap[getId(id)]).filter(Boolean)}
            />
          ))}
        </div>

        {/* Pagination */}
        {Math.ceil(filteredCars.length / ITEMS_PER_PAGE) > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {[...Array(Math.ceil(filteredCars.length / ITEMS_PER_PAGE))].map((_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? "default" : "outline"}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredCars.length / ITEMS_PER_PAGE), prev + 1))}
              disabled={currentPage === Math.ceil(filteredCars.length / ITEMS_PER_PAGE)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
