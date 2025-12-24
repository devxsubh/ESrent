'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { Category } from '@/types/category';
import { frontendServices } from '@/lib/services/frontendServices';
import { Header } from '../home/components/Header';
import { Button } from '@/components/ui/button';
import { SearchBar } from '../home/components/SearchBar';

interface CategoryFilterValues {
  types: string[];
  features: string[];
}

interface CategoryWithCarCount extends Category {
  realCarCount: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCarCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredCategories, setFilteredCategories] = useState<CategoryWithCarCount[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<CategoryFilterValues>({
    types: [],
    features: [],
  });

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadCategoriesWithCarCount = async () => {
      try {
        setLoading(true);
        // Fetch categories with car counts from API
        const response: unknown = await frontendServices.getCategoriesWithCarCounts();
        let categoriesArr: Category[] = [];
        if (typeof response === 'object' && response !== null) {
          if (Array.isArray((response as { data?: unknown }).data)) {
            categoriesArr = (response as { data: Category[] }).data;
          } else if (Array.isArray((response as { categories?: unknown }).categories)) {
            categoriesArr = (response as { categories: Category[] }).categories;
          }
        }
        const categoriesWithCount = categoriesArr.map((category) => ({
          ...category,
          realCarCount: category.carCount || 0
        }));
        setCategories(categoriesWithCount);
        setFilteredCategories(categoriesWithCount);
      } catch (error) {
        console.error('Error loading categories with car count:', error);
        // Fallback to empty array if API fails
        setCategories([]);
        setFilteredCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategoriesWithCarCount();
  }, []);

  const handleFilterChange = (filterType: keyof CategoryFilterValues, value: string) => {
    setSelectedFilters(prev => {
      const currentValues = prev[filterType];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      const updatedFilters = {
        ...prev,
        [filterType]: newValues
      };
      
      // Apply filters
      const filtered = applyFilters(categories, updatedFilters, searchQuery);
      setFilteredCategories(filtered);
      
      return updatedFilters;
    });
  };

  const applyFilters = (allCategories: CategoryWithCarCount[], filters: CategoryFilterValues, search: string) => {
    let filtered = allCategories;
    // Search filter
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(cat =>
        cat.name.toLowerCase().includes(q) ||
        cat.slug.toLowerCase().includes(q)
      );
    }
    // If no filters are selected, return all (after search)
    if (filters.types.length === 0 && filters.features.length === 0) {
      return filtered;
    }
    return filtered.filter(category => {
      const hasActiveTypeFilters = filters.types.length > 0;
      const hasActiveFeatureFilters = filters.features.length > 0;
      switch (category.type) {
        case 'carType':
          if (hasActiveTypeFilters) {
            return filters.types.includes(category.slug);
          }
          return !hasActiveFeatureFilters;
        case 'tag':
          if (hasActiveFeatureFilters) {
            return filters.features.includes(category.slug);
          }
          return !hasActiveTypeFilters;
        default:
          return false;
      }
    });
  };

  const clearFilters = () => {
    setSelectedFilters({
      types: [],
      features: [],
    });
    setSearchQuery('');
    setFilteredCategories(categories);
  };

  const hasActiveFilters = selectedFilters.types.length > 0 || 
    selectedFilters.features.length > 0;

  // Group categories by type for filter buttons
  const carTypes = categories.filter(cat => cat.type === 'carType');
  const features = categories.filter(cat => cat.type === 'tag');

  // Add effect to update filteredCategories when searchQuery changes
  useEffect(() => {
    setFilteredCategories(applyFilters(categories, selectedFilters, searchQuery));
  }, [searchQuery, categories, selectedFilters]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-black justify-center align-center max-w-7xl mx-auto">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full p-4">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-800/50 rounded-lg"></div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black max-w-7xl mx-auto w-full">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search categories by name or slug..." />
        </div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-white">All Categories</h1>
          <div className="text-sm text-gray-400">
            Showing {filteredCategories.length} of {categories.length} categories
          </div>
        </div>

        {/* Filter Sections */}
        <div className="mb-8 space-y-4">
          <div className="space-y-2">
            <h2 className="text-lg font-medium text-white">Filter By:</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant={hasActiveFilters ? "outline" : "default"}
                onClick={clearFilters}
                className={hasActiveFilters ? "border-gray-600 text-gray-300 hover:bg-gray-800" : "bg-[#44caad] hover:bg-[#3ab89a]"}
              >
                All Categories
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-lg font-medium text-white">Car Types</h2>
            <div className="flex flex-wrap gap-2">
              {carTypes.map((type) => (
                <Button
                  key={type.id}
                  variant={selectedFilters.types.includes(type.slug) ? "default" : "outline"}
                  onClick={() => handleFilterChange('types', type.slug)}
                  className={selectedFilters.types.includes(type.slug) 
                    ? "bg-[#44caad] hover:bg-[#3ab89a]" 
                    : "border-gray-600 text-gray-300 hover:bg-gray-800"}
                >
                  {type.name} ({type.realCarCount})
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-medium text-white">Features</h2>
            <div className="flex flex-wrap gap-2">
              {features.map((feature) => (
                <Button
                  key={feature.id}
                  variant={selectedFilters.features.includes(feature.slug) ? "default" : "outline"}
                  onClick={() => handleFilterChange('features', feature.slug)}
                  className={selectedFilters.features.includes(feature.slug) 
                    ? "bg-[#44caad] hover:bg-[#3ab89a]" 
                    : "border-gray-600 text-gray-300 hover:bg-gray-800"}
                >
                  {feature.name} ({feature.realCarCount})
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-medium text-white">Active Filters</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-400 hover:text-white"
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {selectedFilters.types.map((type, index) => {
                const category = carTypes.find(c => c.slug === type);
                return (
                  <span
                    key={`active-type-${index}-${type}`}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium flex items-center gap-1"
                  >
                    <span>{category?.name || type}</span>
                    <button 
                      onClick={() => handleFilterChange('types', type)}
                      className="ml-1 text-primary/70 hover:text-primary"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </span>
                );
              })}
              {selectedFilters.features.map((feature, index) => {
                const category = features.find(c => c.slug === feature);
                return (
                  <span
                    key={`active-feature-${index}-${feature}`}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium flex items-center gap-1"
                  >
                    <span>{category?.name || feature}</span>
                    <button 
                      onClick={() => handleFilterChange('features', feature)}
                      className="ml-1 text-primary/70 hover:text-primary"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <Link
              key={String(category.id)}
              href={`/category/${encodeURIComponent(String(category.id))}`}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 h-full bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardContent className="p-0">
                  <div className="aspect-[16/9] relative">
                    <Image
                      src={category.image || '/images/luxury-car-bg.jpg'}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                      <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                      <p className="text-white/80 mt-1">{typeof category.realCarCount === 'number' ? category.realCarCount : 0} cars</p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-800/50">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-400">
                        {getCategoryTypeLabel(category.type)}
                      </div>
                      <Button className="rounded-full bg-[#44caad] hover:bg-[#3ab89a] text-white" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2 text-white">No categories match your filters</h3>
            <p className="text-gray-400 mb-4">Try adjusting your filter criteria</p>
            <Button onClick={clearFilters} className="bg-[#44caad] hover:bg-[#3ab89a]">Clear All Filters</Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions
function getCategoryTypeLabel(type: string): string {
  switch (type) {
    case 'carType':
      return 'Car Type';
    case 'fuelType':
      return 'Fuel Type';
    case 'tag':
      return 'Feature';
    default:
      return type;
  }
}
