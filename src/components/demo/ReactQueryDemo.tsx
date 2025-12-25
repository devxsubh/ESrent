'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  useCars, 
  useBrands, 
  useCategories, 
  useBackgroundSync,
  usePrefetchCar,
  usePrefetchBrand,
  useOptimisticUpdate,
  queryKeys
} from '@/hooks/useReactQuery';
import Link from 'next/link';
import { RefreshCw, Zap, Clock, Database, TrendingUp, Eye } from 'lucide-react';

export function ReactQueryDemo() {
  const [selectedCarId, setSelectedCarId] = useState<string>('demo-car-1');
  const [selectedBrandId, setSelectedBrandId] = useState<string>('demo-brand-1');

  // React Query hooks
  const carsQuery = useCars({ featured: true, limit: 5 });
  const brandsQuery = useBrands({ featured: true, limit: 5 });
  const categoriesQuery = useCategories({ featured: true, limit: 5 });
  
  // Background sync
  const { syncAllData, syncCars, syncBrands, syncCategories } = useBackgroundSync();
  
  // Prefetching hooks
  const prefetchCar = usePrefetchCar(selectedCarId);
  const prefetchBrand = usePrefetchBrand(selectedBrandId);

  // Optimistic update example
  const optimisticUpdate = useOptimisticUpdate(
    queryKeys.cars.detail(selectedCarId),
    (oldData: { name?: string } | null | undefined) => ({
      ...oldData,
      name: oldData?.name ? `${oldData.name} (Updated!)` : 'Demo Car (Updated!)'
    })
  );

  const handleOptimisticUpdate = () => {
    const rollback = optimisticUpdate(() => {
      // Simulate API call
      setTimeout(() => {
        console.log('API call completed');
      }, 2000);
    });

    // Auto-rollback after 3 seconds if needed
    setTimeout(rollback, 3000);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">React Query Demo</h1>
        <p className="text-gray-400">Advanced caching, mutations, and background updates</p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Database className="w-4 h-4" />
              Cars Cache
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {carsQuery.data?.data?.length || 0}
            </div>
            <div className="text-xs text-gray-400">
              {carsQuery.isLoading ? 'Loading...' : 'Cached items'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Brands Cache
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {brandsQuery.data?.data?.length || 0}
            </div>
            <div className="text-xs text-gray-400">
              {brandsQuery.isLoading ? 'Loading...' : 'Cached items'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Stale Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">5m</div>
            <div className="text-xs text-gray-400">Data freshness</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Window Focus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">✓</div>
            <div className="text-xs text-gray-400">Auto-refresh</div>
          </CardContent>
        </Card>
      </div>

      {/* Background Sync Controls */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Background Sync
          </CardTitle>
          <CardDescription className="text-gray-400">
            Manually trigger cache invalidation and background updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={syncCars}
              variant="outline"
              size="sm"
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              Sync Cars
            </Button>
            <Button
              onClick={syncBrands}
              variant="outline"
              size="sm"
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              Sync Brands
            </Button>
            <Button
              onClick={syncCategories}
              variant="outline"
              size="sm"
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              Sync Categories
            </Button>
            <Button
              onClick={syncAllData}
              variant="outline"
              size="sm"
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              Sync All
            </Button>
          </div>
          
          <div className="text-sm text-gray-400">
            <p>• Cars: 5 min stale time, 10 min garbage collection</p>
            <p>• Brands: 10 min stale time, 15 min garbage collection</p>
            <p>• Categories: 10 min stale time, 15 min garbage collection</p>
          </div>
        </CardContent>
      </Card>

      {/* Prefetching Demo */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Prefetching
          </CardTitle>
          <CardDescription className="text-gray-400">
            Preload data for better user experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={prefetchCar}
              variant="outline"
              size="sm"
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              Prefetch Car
            </Button>
            <Button
              onClick={prefetchBrand}
              variant="outline"
              size="sm"
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              Prefetch Brand
            </Button>
          </div>
          
          <div className="text-sm text-gray-400">
            <p>• Prefetching loads data into cache before user needs it</p>
            <p>• Improves perceived performance and user experience</p>
          </div>
        </CardContent>
      </Card>

      {/* Optimistic Updates Demo */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Optimistic Updates
          </CardTitle>
          <CardDescription className="text-gray-400">
            Update UI immediately while API call happens in background
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleOptimisticUpdate}
            variant="outline"
            size="sm"
            className="border-gray-600 text-white hover:bg-gray-700"
          >
            Try Optimistic Update
          </Button>
          
          <div className="text-sm text-gray-400">
            <p>• UI updates immediately for better responsiveness</p>
            <p>• Automatic rollback if API call fails</p>
            <p>• Perfect for forms, likes, and quick interactions</p>
          </div>
        </CardContent>
      </Card>

      {/* Query States Demo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Cars Query</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Status:</span>
              <Badge variant={carsQuery.isLoading ? "secondary" : "default"}>
                {carsQuery.isLoading ? 'Loading' : 'Success'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Data:</span>
              <span className="text-white text-sm">
                {carsQuery.data?.data?.length || 0} items
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Error:</span>
              <span className="text-white text-sm">
                {carsQuery.error ? 'Yes' : 'No'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Brands Query</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Status:</span>
              <Badge variant={brandsQuery.isLoading ? "secondary" : "default"}>
                {brandsQuery.isLoading ? 'Loading' : 'Success'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Data:</span>
              <span className="text-white text-sm">
                {brandsQuery.data?.data?.length || 0} items
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Error:</span>
              <span className="text-white text-sm">
                {brandsQuery.error ? 'Yes' : 'No'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Categories Query</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Status:</span>
              <Badge variant={categoriesQuery.isLoading ? "secondary" : "default"}>
                {categoriesQuery.isLoading ? 'Loading' : 'Success'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Data:</span>
                              <span className="text-white text-sm">
                  {categoriesQuery.data?.data?.length || 0} items
                </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Error:</span>
              <span className="text-white text-sm">
                {categoriesQuery.error ? 'Yes' : 'No'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features List */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">React Query Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-white">Automatic background refetching</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-white">Smart caching with stale time</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-white">Automatic garbage collection</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-white">Window focus refetching</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-white">Network reconnection handling</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-white">Optimistic updates</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-white">Automatic retry on failure</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-white">Infinite queries for pagination</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cursor Pagination Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <Database className="h-5 w-5" />
            Advanced: Cursor-Based Pagination
          </CardTitle>
          <CardDescription className="text-blue-700">
            Experience the next level of pagination with cursor-based infinite loading
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">🚀 Performance Benefits</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Consistent performance regardless of page number</li>
                <li>• No duplicate or missing items during pagination</li>
                <li>• Efficient for large datasets</li>
                <li>• Better for real-time applications</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">🔧 Available Hooks</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <code>useInfiniteCarsCursor</code></li>
                <li>• <code>useInfiniteBrandsCursor</code></li>
                <li>• <code>useInfiniteCategoriesCursor</code></li>
                <li>• <code>useInfiniteReviewsCursor</code></li>
              </ul>
            </div>
          </div>
          
          <div className="bg-blue-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Try Cursor Pagination</h4>
                <p className="text-blue-700 text-sm">
                  Experience infinite scrolling with cursor-based pagination
                </p>
              </div>
              <Link href="/demo/cursor-pagination">
                <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
