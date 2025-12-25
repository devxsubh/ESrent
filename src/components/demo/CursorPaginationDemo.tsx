"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { InfiniteScroll } from '@/components/ui/InfiniteScroll';
import { 
  useInfiniteCarsCursor, 
  useInfiniteBrandsCursor, 
  useInfiniteCategoriesCursor,
  useInfiniteReviewsCursor 
} from '@/hooks/useReactQuery';
import { 
  Car, 
  Building2, 
  Tag, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp,
  Filter,
  Search,
  Star
} from 'lucide-react';

export function CursorPaginationDemo() {
  const [selectedTab, setSelectedTab] = useState<'cars' | 'brands' | 'categories' | 'reviews'>('cars');
  const [filters, setFilters] = useState({
    search: '',
    brand: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    featured: false,
  });

  // Cursor-based infinite queries
  const carsQuery = useInfiniteCarsCursor({
    search: filters.search || undefined,
    brand: filters.brand || undefined,
    category: filters.category || undefined,
    minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
    featured: filters.featured,
  });

  const brandsQuery = useInfiniteBrandsCursor({
    search: filters.search || undefined,
    featured: filters.featured,
  });

  const categoriesQuery = useInfiniteCategoriesCursor({
    search: filters.search || undefined,
    featured: filters.featured,
  });

  const reviewsQuery = useInfiniteReviewsCursor({
    carId: undefined, // Could be set to a specific car ID
  });

  // Flatten data from all pages
  interface PaginatedPage<T> {
    data: T[];
    nextCursor?: string;
  }
  
  const carsData = (carsQuery.data?.pages.flatMap((page) => page.data) || []) as unknown as CarItem[];
  const brandsData = (brandsQuery.data?.pages.flatMap((page) => page.data) || []) as unknown as BrandItem[];
  const categoriesData = (categoriesQuery.data?.pages.flatMap((page) => page.data) || []) as unknown as CategoryItem[];
  const reviewsData = (reviewsQuery.data?.pages.flatMap((page) => page.data) || []) as unknown as ReviewItem[];

  interface CarItem {
    _id?: string;
    name: string;
    brand?: { name: string };
    category?: { name: string };
    transmission?: string;
    fuelType?: string;
    seats?: number;
    rating?: number;
    reviewCount?: number;
    pricePerDay?: number;
  }

  interface BrandItem {
    _id?: string;
    name: string;
    description?: string;
    carCount?: number;
    featured?: boolean;
  }

  interface CategoryItem {
    _id?: string;
    name: string;
    description?: string;
    carCount?: number;
    featured?: boolean;
  }

  interface ReviewItem {
    _id?: string;
    userName: string;
    rating: number;
    title: string;
    comment: string;
    car?: { name: string };
    createdAt?: string | Date;
  }

  const renderCarItem = (car: CarItem, index: number) => (
    <Card key={`${car._id}-${index}`} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{car.name}</h3>
            <p className="text-gray-600 text-sm">{car.brand?.name} • {car.category?.name}</p>
            <div className="flex items-center gap-4 mt-2">
              <Badge variant="secondary">{car.transmission}</Badge>
              <Badge variant="secondary">{car.fuelType}</Badge>
              <Badge variant="secondary">{car.seats} seats</Badge>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{car.rating || 'N/A'}</span>
              <span className="text-sm text-gray-500">({car.reviewCount || 0} reviews)</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              ${car.pricePerDay}
            </div>
            <div className="text-sm text-gray-500">per day</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderBrandItem = (brand: BrandItem, index: number) => (
    <Card key={`${brand._id}-${index}`} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
            <Building2 className="h-8 w-8 text-gray-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{brand.name}</h3>
            <p className="text-gray-600 text-sm">{brand.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{brand.carCount || 0} cars</Badge>
              {brand.featured && <Badge variant="default">Featured</Badge>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderCategoryItem = (category: CategoryItem, index: number) => (
    <Card key={`${category._id}-${index}`} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
            <Tag className="h-8 w-8 text-gray-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{category.name}</h3>
            <p className="text-gray-600 text-sm">{category.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{category.carCount || 0} cars</Badge>
              {category.featured && <Badge variant="default">Featured</Badge>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderReviewItem = (review: ReviewItem, index: number) => (
    <Card key={`${review._id}-${index}`} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-gray-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">{review.userName}</h3>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
            </div>
            <h4 className="font-medium mb-1">{review.title}</h4>
            <p className="text-gray-600 text-sm">{review.comment}</p>
            <div className="text-xs text-gray-500 mt-2">
              {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'No date'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'cars':
        return (
          <InfiniteScroll
            data={carsData}
            fetchNextPage={carsQuery.fetchNextPage}
            hasNextPage={carsQuery.hasNextPage}
            isFetchingNextPage={carsQuery.isFetchingNextPage}
            isLoading={carsQuery.isLoading}
            isError={carsQuery.isError}
            error={carsQuery.error || undefined}
            renderItem={renderCarItem}
            renderEmpty={() => (
              <div className="text-center py-8">
                <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No cars found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            )}
            className="space-y-4"
            autoLoad={true}
            manualLoadButton={false}
          />
        );
      case 'brands':
        return (
          <InfiniteScroll
            data={brandsData}
            fetchNextPage={brandsQuery.fetchNextPage}
            hasNextPage={brandsQuery.hasNextPage}
            isFetchingNextPage={brandsQuery.isFetchingNextPage}
            isLoading={brandsQuery.isLoading}
            isError={brandsQuery.isError}
            error={brandsQuery.error || undefined}
            renderItem={renderBrandItem}
            renderEmpty={() => (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No brands found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            )}
            className="space-y-4"
            autoLoad={true}
            manualLoadButton={false}
          />
        );
      case 'categories':
        return (
          <InfiniteScroll
            data={categoriesData}
            fetchNextPage={categoriesQuery.fetchNextPage}
            hasNextPage={categoriesQuery.hasNextPage}
            isFetchingNextPage={categoriesQuery.isFetchingNextPage}
            isLoading={categoriesQuery.isLoading}
            isError={categoriesQuery.isError}
            error={categoriesQuery.error || undefined}
            renderItem={renderCategoryItem}
            renderEmpty={() => (
              <div className="text-center py-8">
                <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No categories found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            )}
            className="space-y-4"
            autoLoad={true}
            manualLoadButton={false}
          />
        );
      case 'reviews':
        return (
          <InfiniteScroll
            data={reviewsData}
            fetchNextPage={reviewsQuery.fetchNextPage}
            hasNextPage={reviewsQuery.hasNextPage}
            isFetchingNextPage={reviewsQuery.isFetchingNextPage}
            isLoading={reviewsQuery.isLoading}
            isError={reviewsQuery.isError}
            error={reviewsQuery.error || undefined}
            renderItem={renderReviewItem}
            renderEmpty={() => (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No reviews found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            )}
            className="space-y-4"
            autoLoad={true}
            manualLoadButton={false}
          />
        );
      default:
        return null;
    }
  };

  const getQueryStats = () => {
    switch (selectedTab) {
      case 'cars':
        return {
          total: (carsQuery.data?.pages[0] as any)?.total || 0,
          loaded: carsData.length,
          hasNext: carsQuery.hasNextPage,
        };
      case 'brands':
        return {
          total: (brandsQuery.data?.pages[0] as any)?.total || 0,
          loaded: brandsData.length,
          hasNext: brandsQuery.hasNextPage,
        };
      case 'categories':
        return {
          total: (categoriesQuery.data?.pages[0] as any)?.total || 0,
          loaded: categoriesData.length,
          hasNext: categoriesQuery.hasNextPage,
        };
      case 'reviews':
        return {
          total: (reviewsQuery.data?.pages[0] as any)?.total || 0,
          loaded: reviewsData.length,
          hasNext: reviewsQuery.hasNextPage,
        };
      default:
        return { total: 0, loaded: 0, hasNext: false };
    }
  };

  const stats = getQueryStats();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Cursor-Based Pagination Demo</h1>
        <p className="text-gray-600">
          Experience efficient infinite loading with cursor-based pagination
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.loaded}</div>
            <div className="text-sm text-gray-600">Loaded Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.hasNext ? 'Yes' : 'No'}
            </div>
            <div className="text-sm text-gray-600">More Available</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>
            Apply filters to see cursor-based pagination in action
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Brand</label>
              <input
                type="text"
                placeholder="Brand name"
                value={filters.brand}
                onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <input
                type="text"
                placeholder="Category name"
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-2">Min Price</label>
              <input
                type="number"
                placeholder="Min price"
                value={filters.minPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Price</label>
              <input
                type="number"
                placeholder="Max price"
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.featured}
                  onChange={(e) => setFilters(prev => ({ ...prev, featured: e.target.checked }))}
                  className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="text-sm font-medium">Featured Only</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'cars', label: 'Cars', icon: Car, count: carsData.length },
          { id: 'brands', label: 'Brands', icon: Building2, count: brandsData.length },
          { id: 'categories', label: 'Categories', icon: Tag, count: categoriesData.length },
          { id: 'reviews', label: 'Reviews', icon: MessageSquare, count: reviewsData.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
              selectedTab === tab.id
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
            <Badge variant="secondary" className="ml-1">
              {tab.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="capitalize">{selectedTab}</span>
            <div className="text-sm text-gray-500">
              Showing {stats.loaded} of {stats.total} items
            </div>
          </CardTitle>
          <CardDescription>
            Scroll down to automatically load more items, or use the manual load button
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderTabContent()}
        </CardContent>
      </Card>

      {/* Features Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>Cursor-Based Pagination Features</CardTitle>
          <CardDescription>
            Learn about the benefits of cursor-based pagination over traditional offset-based pagination
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-green-600">✅ Advantages</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <ChevronUp className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Consistent performance regardless of page number</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronUp className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>No duplicate or missing items when data changes</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronUp className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Efficient for large datasets</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronUp className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Better for real-time applications</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-red-600">❌ Traditional Offset Issues</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <ChevronDown className="h-4 w-4 text-red-500 mt-0.5" />
                  <span>Performance degrades with higher page numbers</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronDown className="h-4 w-4 text-red-500 mt-0.5" />
                  <span>Items can be skipped or duplicated during pagination</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronDown className="h-4 w-4 text-red-500 mt-0.5" />
                  <span>Poor performance with large offsets</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronDown className="h-4 w-4 text-red-500 mt-0.5" />
                  <span>Not suitable for real-time data</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
