import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { frontendServices } from '@/lib/services/frontendServices';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseApiOptions {
  immediate?: boolean;
  dependencies?: unknown[];
  cacheKey?: string;
}


// Cache for storing API responses
const apiCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Debug: Track API calls
const apiCallCounts = new Map<string, number>();

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second base delay

// Helper function to generate stable cache keys
function generateCacheKey(endpoint: string, params?: Record<string, unknown>): string {
  if (!params) return endpoint;
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      if (params[key] !== undefined && params[key] !== null) {
        acc[key] = params[key];
      }
      return acc;
    }, {} as Record<string, unknown>);
  return `${endpoint}-${JSON.stringify(sortedParams)}`;
}

// Generic hook for API calls with caching
export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = {}
): UseApiState<T> & { refetch: () => Promise<void> } {
  const { immediate = true, dependencies = [], cacheKey } = options;
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const isMountedRef = useRef(true);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    hasInitializedRef.current = false; // Ensure fresh fetch on every mount
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Memoize the API call to prevent infinite re-renders
  const memoizedApiCall = useCallback(apiCall, [apiCall, ...dependencies]);

  const fetchData = useCallback(async (forceRefresh = false, retryCount = 0) => {
    if (!isMountedRef.current) return;

    // Debug: Track API calls
    if (cacheKey) {
      const count = (apiCallCounts.get(cacheKey) || 0) + 1;
      apiCallCounts.set(cacheKey, count);
      // console.log(`API Call #${count} for ${cacheKey}`);
    }

    // Check cache first (unless forcing refresh or retrying)
    if (cacheKey && !forceRefresh && retryCount === 0) {
      const cached = apiCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        // console.log(`Cache hit for ${cacheKey}`);
        setState({ data: cached.data as T, loading: false, error: null });
        return;
      }
    }

    // console.log(`Fetching data for ${cacheKey}`);
    setState(prev => ({ ...prev, loading: true, error: null }));
    // console.log('fetchData: set loading true');
    
    try {
      // console.log('fetchData: calling memoizedApiCall');
      const data = await memoizedApiCall();
      // console.log('fetchData: API call resolved', data);
      
      if (isMountedRef.current) {
        setState({ data, loading: false, error: null });
        // console.log('fetchData: set state with data', data);
        
        // Cache the result
        if (cacheKey) {
          apiCache.set(cacheKey, { data, timestamp: Date.now() });
          // console.log(`Cached data for ${cacheKey}`);
        }
      } else {
        // console.log('fetchData: not mounted, skipping setState');
      }
    } catch (error) {
      console.error('fetchData: API error', error);
      
      // Retry logic for network errors
      const isNetworkError = error instanceof Error && (
        error.message.includes('timeout') ||
        error.message.includes('Network error') ||
        error.message.includes('Failed to fetch') ||
        error.name === 'AbortError'
      );
      
      if (isNetworkError && retryCount < MAX_RETRIES && isMountedRef.current) {
        // Exponential backoff retry
        const delay = RETRY_DELAY * Math.pow(2, retryCount);
        console.log(`Retrying request (attempt ${retryCount + 1}/${MAX_RETRIES}) after ${delay}ms...`);
        
        setTimeout(() => {
          if (isMountedRef.current) {
            fetchData(forceRefresh, retryCount + 1);
          }
        }, delay);
        return;
      }
      
      if (isMountedRef.current) {
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : 'An error occurred',
        });
        // console.log('fetchData: set state with error', error);
      } else {
        // console.log('fetchData: not mounted, skipping setState (error)');
      }
    }
  }, [memoizedApiCall, cacheKey]);

  useEffect(() => {
    if (immediate && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      fetchData();
    }
  }, [fetchData, immediate]);

  // Timeout is now handled at the fetch level with AbortController
  // No need for hard timeout that only hides loading state

  return { ...state, refetch: () => fetchData(true) };
}

// Hook for cars
export function useCars(params?: {
  search?: string;
  brand?: string;
  brandId?: string;
  category?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  featured?: boolean;
}) {
  const stableParams = useMemo(() => params, [params]);
  const cacheKey = useMemo(() => {
    return generateCacheKey('cars', stableParams);
  }, [stableParams]);

  const apiCall = useCallback(() => frontendServices.getCars(stableParams), [stableParams]);

  return useApi(apiCall, { 
    dependencies: [stableParams],
    cacheKey 
  });
}

// Hook for a single car
export function useCar(id: string) {
  const stableId = useMemo(() => id, [id]);
  const apiCall = useCallback(() => frontendServices.getCar(stableId), [stableId]);

  return useApi(apiCall, { 
    dependencies: [stableId],
    cacheKey: `car-${stableId}`
  });
}

// Hook for brands
export function useBrands(params?: {
  search?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}) {
  const stableParams = useMemo(() => params, [params]);
  const cacheKey = useMemo(() => {
    return generateCacheKey('brands', stableParams);
  }, [stableParams]);

  const apiCall = useCallback(() => frontendServices.getBrands(stableParams), [stableParams]);
  
  return useApi(apiCall, { 
    dependencies: [stableParams],
    cacheKey 
  });
}

// Hook for a single brand
export function useBrand(id: string) {
  const stableId = useMemo(() => id, [id]);
  const apiCall = useCallback(() => frontendServices.getBrand(stableId), [stableId]);

  return useApi(apiCall, { 
    dependencies: [stableId],
    cacheKey: `brand-${stableId}`
  });
}

// Hook for categories
export function useCategories(params?: {
  search?: string;
  type?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}) {
  const stableParams = useMemo(() => params, [params]);
  const cacheKey = useMemo(() => {
    return generateCacheKey('categories', stableParams);
  }, [stableParams]);

  const apiCall = useCallback(() => frontendServices.getCategories(stableParams), [stableParams]);

  return useApi(apiCall, { 
    dependencies: [stableParams],
    cacheKey 
  });
}

// Hook for a single category
export function useCategory(id: string) {
  const stableId = useMemo(() => id, [id]);
  const apiCall = useCallback(() => frontendServices.getCategory(stableId), [stableId]);

  return useApi(apiCall, { 
    dependencies: [stableId],
    cacheKey: `category-${stableId}`
  });
}

export { useAuth } from './useAuthContext'; 