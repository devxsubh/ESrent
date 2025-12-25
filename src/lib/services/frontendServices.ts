const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CursorPaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  prevCursor?: string;
  hasNext: boolean;
  hasPrev: boolean;
  total: number;
}

class FrontendServices {
  private baseURL: string;
  private defaultTimeout: number = 30000; // 30 seconds

  constructor() {
    this.baseURL = `${API_BASE_URL}/api`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    timeout: number = this.defaultTimeout
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Handle timeout/abort errors
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timed out. Please check your internet connection and try again.');
        }
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error('Network error. Please check your internet connection and try again.');
        }
      }
      
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Authentication methods
  async login(email: string, password: string) {
    return this.request<{ token: string; user: Record<string, unknown> }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: { email: string; password: string; name: string; role: string }) {
    return this.request<{ message: string; user: Record<string, unknown> }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async verifyToken(token: string) {
    return this.request<{ valid: boolean; user?: Record<string, unknown> }>('/auth/verify', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async logout() {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  }

  // Cars API
  async getCars(params?: {
    search?: string;
    brand?: string;
    category?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
    featured?: boolean;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = `/cars${queryString ? `?${queryString}` : ''}`;
    
    return this.request<PaginatedResponse<Record<string, unknown>>>(endpoint);
  }

  // Cursor-based pagination for cars
  async getCarsCursor(params?: {
    search?: string;
    brand?: string;
    category?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    cursor?: string;
    limit?: number;
    featured?: boolean;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = `/cars/cursor${queryString ? `?${queryString}` : ''}`;
    
    return this.request<CursorPaginatedResponse<Record<string, unknown>>>(endpoint);
  }

  async getCar(id: string) {
    return this.request<Record<string, unknown>>(`/cars/${id}`);
  }

  async createCar(carData: Record<string, unknown>, token: string) {
    return this.request<Record<string, unknown>>('/cars', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(carData),
    });
  }



  async deleteCar(id: string, token: string) {
    return this.request<{ message: string }>(`/cars/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Brands API
  async getBrands(params?: {
    search?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = `/brands${queryString ? `?${queryString}` : ''}`;
    
    return this.request<PaginatedResponse<Record<string, unknown>>>(endpoint);
  }

  // Cursor-based pagination for brands
  async getBrandsCursor(params?: {
    search?: string;
    featured?: boolean;
    cursor?: string;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = `/brands/cursor${queryString ? `?${queryString}` : ''}`;
    
    return this.request<CursorPaginatedResponse<Record<string, unknown>>>(endpoint);
  }

  async getBrand(id: string) {
    return this.request<Record<string, unknown>>(`/brands/${id}`);
  }

  async createBrand(brandData: Record<string, unknown>, token: string) {
    return this.request<Record<string, unknown>>('/brands', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(brandData),
    });
  }

  async updateBrand(id: string, brandData: Record<string, unknown>, token: string) {
    return this.request<Record<string, unknown>>(`/brands/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(brandData),
    });
  }

  async deleteBrand(id: string, token: string) {
    return this.request<{ message: string }>(`/brands/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Categories API
  async getCategories(params?: {
    search?: string;
    type?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = `/categories${queryString ? `?${queryString}` : ''}`;
    
    return this.request<PaginatedResponse<Record<string, unknown>>>(endpoint);
  }

  // Cursor-based pagination for categories
  async getCategoriesCursor(params?: {
    search?: string;
    type?: string;
    featured?: boolean;
    cursor?: string;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = `/categories/cursor${queryString ? `?${queryString}` : ''}`;
    
    return this.request<CursorPaginatedResponse<Record<string, unknown>>>(endpoint);
  }

  async getCategoriesWithCarCounts() {
    return this.request<{ categories: Record<string, unknown>[] }>('/categories?withCarCounts=true');
  }

  async getCategory(id: string) {
    return this.request<Record<string, unknown>>(`/categories/${id}`);
  }

  async createCategory(categoryData: Record<string, unknown>, token: string) {
    return this.request<Record<string, unknown>>('/categories', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(id: string, categoryData: Record<string, unknown>, token: string) {
    return this.request<Record<string, unknown>>(`/categories/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id: string, token: string) {
    return this.request<{ message: string }>(`/categories/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Upload API
  async uploadImage(file: File, token: string) {
    const formData = new FormData();
    formData.append('image', file);

    return this.request<{ url: string; publicId: string }>('/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  }

  // Reviews API
  async getReviews(params?: {
    carId?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = `/reviews${queryString ? `?${queryString}` : ''}`;
    
    return this.request<PaginatedResponse<Record<string, unknown>>>(endpoint);
  }

  // Cursor-based pagination for reviews
  async getReviewsCursor(params?: {
    carId?: string;
    cursor?: string;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = `/reviews/cursor${queryString ? `?${queryString}` : ''}`;
    
    return this.request<CursorPaginatedResponse<Record<string, unknown>>>(endpoint);
  }

  async getReview(id: string) {
    return this.request<Record<string, unknown>>(`/reviews/${id}`);
  }

  async createReview(reviewData: {
    carId: string;
    userName: string;
    userEmail?: string;
    rating: number;
    title: string;
    comment: string;
  }) {
    return this.request<Record<string, unknown>>('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async updateReview(id: string, reviewData: {
    userName?: string;
    userEmail?: string;
    rating?: number;
    title?: string;
    comment?: string;
  }) {
    return this.request<Record<string, unknown>>(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  }

  async deleteReview(id: string) {
    return this.request<{ message: string }>(`/reviews/${id}`, {
      method: 'DELETE',
    });
  }

  async getReviewStats(carId: string) {
    return this.request<Record<string, unknown>>(`/reviews/stats/${carId}`);
  }

  // Car mutations
  async updateCar(id: string, updates: Record<string, unknown>) {
    return this.request<Record<string, unknown>>(`/cars/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }
}

export const frontendServices = new FrontendServices(); 