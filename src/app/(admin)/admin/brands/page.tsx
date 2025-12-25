'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Pencil, Trash2, Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Building2, Star, Image as ImageIcon, Car, RefreshCw, Search, Filter, Loader2 } from 'lucide-react';
import { Brand } from '@/types/brand';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { BrandDialog } from '@/components/admin/brand-dialog';
import { StatusModal } from '@/components/admin/status-modal';
import { useToast } from '@/components/hooks/use-toast';
import { useAuth } from '@/hooks/useApi';

export default function AdminBrands() {
  const { token } = useAuth();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ error: string; details?: string } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | undefined>();
  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    status: 'success' | 'error';
  }>({
    open: false,
    title: '',
    description: '',
    status: 'success',
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBrands, setTotalBrands] = useState(0);
  const [pageSize] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState<string>('all');
  
  // Stats state for total data
  const [stats, setStats] = useState({
    total: 0,
    featured: 0,
    withLogos: 0,
    totalCars: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  
  const { toast } = useToast();

  const fetchBrands = async (page: number = currentPage) => {
    try {
      setError(null);
      setLoading(true);
      
      // Fetch from API route with pagination
      // console.log(`Fetching brands from /api/brands?page=${page}&limit=${pageSize}...`);
      const res = await fetch(`/api/brands?page=${page}&limit=${pageSize}`);
      const data = await res.json();
      // console.log('Raw /api/brands response:', data);
      
      let brandsArray: Brand[] = [];
      if (data.data && Array.isArray(data.data)) {
        brandsArray = data.data;
        setTotalBrands(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.page || page);
      } else if (Array.isArray(data)) {
        brandsArray = data;
        setTotalBrands(brandsArray.length);
        setTotalPages(1);
        setCurrentPage(1);
      } else if (data.brands && Array.isArray(data.brands)) {
        brandsArray = data.brands;
        setTotalBrands(data.total || brandsArray.length);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.page || 1);
      }
      
      setBrands([...brandsArray]);
    } catch (error) {
      console.error('Error fetching brands:', error);
      setError({
        error: 'Failed to fetch brands',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch total stats from all brands
  const fetchTotalStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await fetch('/api/brands?limit=1000'); // Get all brands for stats
      const data = await res.json();
      
      let allBrands: Brand[] = [];
      if (data.data && Array.isArray(data.data)) {
        allBrands = data.data;
      } else if (Array.isArray(data)) {
        allBrands = data;
      } else if (data.brands && Array.isArray(data.brands)) {
        allBrands = data.brands;
      }

      // Calculate stats from all brands
      const total = allBrands.length;
      const featured = allBrands.filter(brand => brand.featured).length;
      const withLogos = allBrands.filter(brand => {
        return brand.logo && typeof brand.logo === 'string' && brand.logo.trim() !== '' && 
               brand.logo !== 'null' && brand.logo !== 'undefined';
      }).length;

      // Fetch total cars count for brands
      let totalCars = 0;
      try {
        const carsRes = await fetch('/api/cars?limit=1000');
        const carsData = await carsRes.json();
        let allCars = [];
        if (carsData.data && Array.isArray(carsData.data)) {
          allCars = carsData.data;
        } else if (Array.isArray(carsData)) {
          allCars = carsData;
        } else if (carsData.cars && Array.isArray(carsData.cars)) {
          allCars = carsData.cars;
        }
        totalCars = allCars.length;
      } catch (error) {
        console.error('Error fetching cars for stats:', error);
      }

      setStats({
        total,
        featured,
        withLogos,
        totalCars,
      });
    } catch (error) {
      console.error('Error fetching total stats:', error);
      // Fallback to current page data
      setStats({
        total: brands.length,
        featured: brands.filter(brand => brand.featured).length,
        withLogos: brands.filter(brand => {
          return brand.logo && typeof brand.logo === 'string' && brand.logo.trim() !== '' && 
                 brand.logo !== 'null' && brand.logo !== 'undefined';
        }).length,
        totalCars: 0,
      });
    } finally {
      setStatsLoading(false);
    }
  }, [brands]);

  useEffect(() => {
    fetchBrands(1);
  }, []);

  useEffect(() => {
    fetchTotalStats();
  }, [fetchTotalStats]);

  // Pagination control functions
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchBrands(page);
    }
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handleAddBrand = () => {
    setSelectedBrand(undefined);
    setDialogOpen(true);
  };

  const handleEditBrand = (brand: Brand) => {
    setSelectedBrand(brand);
    setDialogOpen(true);
  };

  const handleDeleteBrand = async (brand: Brand) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) return;

    try {
      if (!token) throw new Error('Not authenticated');
      const res = await fetch(`/api/brands/${brand.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      toast({
        title: 'Brand deleted',
        description: `${brand.name} has been deleted successfully.`,
      });
      fetchBrands(currentPage);
      fetchTotalStats(); // Refresh stats after deletion
    } catch (error) {
      console.error('Error deleting brand:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete brand. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveBrand = async (brandData: Partial<Brand>) => {
    try {
      if (!token) throw new Error('Not authenticated');
      if (selectedBrand) {
        const res = await fetch(`/api/brands/${selectedBrand.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(brandData),
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const errorMessage = errorData.error || `HTTP error! status: ${res.status}`;
          
          // Handle specific error cases
          if (res.status === 400) {
            throw new Error(`Validation Error: ${errorMessage}`);
          } else if (res.status === 404) {
            throw new Error('Brand not found. It may have been deleted by another user.');
          } else if (res.status === 401) {
            throw new Error('Authentication expired. Please log in again.');
          } else if (res.status === 403) {
            throw new Error('You do not have permission to update this brand.');
          } else if (res.status === 409) {
            throw new Error('Brand name already exists. Please choose a different name.');
          } else {
            throw new Error(`Update failed: ${errorMessage}`);
          }
        }
        
        const updatedBrand = await res.json();
        setBrands(prevBrands => 
          prevBrands.map(brand => 
            brand.id === selectedBrand.id ? { ...brand, ...updatedBrand } : brand
          )
        );
      } else {
        // Ensure brandData matches CreateBrandData type
        const requiredFields: (keyof Brand)[] = ['name'];
        for (const field of requiredFields) {
          const fieldValue = brandData[field];
          if (!fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0)) {
            throw new Error(`Missing required field: ${field}`);
          }
        }
        
        const res = await fetch('/api/brands', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(brandData),
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const errorMessage = errorData.error || `HTTP error! status: ${res.status}`;
          
          // Handle specific error cases
          if (res.status === 400) {
            throw new Error(`Validation Error: ${errorMessage}`);
          } else if (res.status === 401) {
            throw new Error('Authentication expired. Please log in again.');
          } else if (res.status === 403) {
            throw new Error('You do not have permission to create brands.');
          } else if (res.status === 409) {
            throw new Error('Brand name already exists. Please choose a different name.');
          } else if (res.status === 413) {
            throw new Error('Brand data is too large. Please reduce the description length.');
          } else {
            throw new Error(`Creation failed: ${errorMessage}`);
          }
        }
        
        const createdBrand = await res.json();
        setBrands(prevBrands => [...prevBrands, createdBrand]);
      }

      // Close dialog and show success message
      setDialogOpen(false);
      setSelectedBrand(undefined);
      setStatusModal({
        open: true,
        title: selectedBrand ? 'Brand Updated' : 'Brand Added',
        description: `${brandData.name} has been ${selectedBrand ? 'updated' : 'added'} successfully.`,
        status: 'success',
      });

      // Fetch fresh data in the background
      fetchBrands(currentPage);
      fetchTotalStats(); // Refresh stats after save
    } catch (error) {
      console.error('Error saving brand:', error);
      
      // Extract specific error message
      let errorMessage = 'Failed to save brand. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setStatusModal({
        open: true,
        title: 'Error',
        description: errorMessage,
        status: 'error',
      });
    }
  };

  // Helper function to validate image URLs
  const isValidImageUrl = (url: string | null | undefined): boolean => {
    // Check if url is a valid string and not empty
    if (!url || typeof url !== 'string') {
      return false;
    }
    
    const trimmedUrl = url.trim();
    return trimmedUrl !== '' && 
           trimmedUrl !== 'null' && 
           trimmedUrl !== 'undefined' &&
           trimmedUrl.length > 0;
  };

  const filteredBrands = brands.filter(brand => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      brand.name.toLowerCase().includes(query) ||
      (brand.slug && brand.slug.toLowerCase().includes(query))
    );
  }).filter(brand => {
    if (featuredFilter === 'all') return true;
    if (featuredFilter === 'featured') return brand.featured;
    if (featuredFilter === 'standard') return !brand.featured;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="w-7 h-7 text-primary" />
            Brands Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your car brands and manufacturers
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => fetchBrands(currentPage)} variant="outline" className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={handleAddBrand}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Brand
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Brands</p>
                <p className="text-2xl font-bold text-foreground">
                  {statsLoading ? '...' : stats.total}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Featured</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {statsLoading ? '...' : stats.featured}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">With Logos</p>
                <p className="text-2xl font-bold text-blue-600">
                  {statsLoading ? '...' : stats.withLogos}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Cars</p>
                <p className="text-2xl font-bold text-green-600">
                  {statsLoading ? '...' : stats.totalCars}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Car className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="standard">Standard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <p className="text-destructive">{error.error}</p>
          <Button variant="outline" size="sm" onClick={() => fetchBrands(currentPage)} className="ml-auto">
            Retry
          </Button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Main Content Card */}
      {!loading && !error && (
        <Card className="bg-card border-border/50">
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead className="text-muted-foreground">Logo</TableHead>
                  <TableHead className="text-muted-foreground">Name</TableHead>
                  <TableHead className="text-muted-foreground">Slug</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBrands.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Brands Found</h3>
                      <p className="text-muted-foreground">
                        {searchQuery || featuredFilter !== 'all'
                          ? 'Try adjusting your search or filters'
                          : 'Get started by adding your first brand.'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBrands.map((brand: Brand) => {
                    // console.log('Brand data:', brand);
                    // console.log('Brand logo:', brand.logo, 'Type:', typeof brand.logo, 'Is object:', typeof brand.logo === 'object');
                    const logoUrl = typeof brand.logo === 'string' ? brand.logo : ''; // Ensure it's always a string
                    return (
                      <TableRow key={brand.id} className="border-border/50 hover:bg-accent/50 transition-colors">
                        <TableCell>
                          {isValidImageUrl(logoUrl) ? (
                            <div className="relative w-12 h-12 rounded-md overflow-hidden">
                              <Image
                                src={logoUrl}
                                alt={brand.name || 'Brand logo'}
                                fill
                                className="object-contain"
                                sizes="48px"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                              <span className="text-muted-foreground text-xs">No logo</span>
                            </div>
                          )}
                        </TableCell>
                                                 <TableCell className="font-medium">{brand.name}</TableCell>
                         <TableCell className="text-muted-foreground">{brand.slug}</TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            brand.featured
                              ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' 
                              : 'bg-gray-500/20 text-gray-600 dark:text-gray-400'
                          }`}>
                            {brand.featured ? 'Featured' : 'Standard'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditBrand(brand)}
                              className="transition-colors hover:bg-primary hover:text-primary-foreground border-border/50"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteBrand(brand)}
                              className="transition-colors hover:bg-destructive hover:text-destructive-foreground border-border/50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              {/* Page Info */}
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalBrands)} of {totalBrands} brands
              </div>

              {/* Pagination Buttons */}
              <div className="flex items-center gap-2">
                {/* First Page */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToFirstPage}
                  disabled={!canGoPrevious}
                  className="h-8 w-8 p-0 border-border/50"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>

                {/* Previous Page */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={!canGoPrevious}
                  className="h-8 w-8 p-0 border-border/50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(pageNum)}
                        className="h-8 w-8 p-0 border-border/50"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                {/* Next Page */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={!canGoNext}
                  className="h-8 w-8 p-0 border-border/50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Last Page */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToLastPage}
                  disabled={!canGoNext}
                  className="h-8 w-8 p-0 border-border/50"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          </CardContent>
        </Card>
      )}

      <BrandDialog
        brand={selectedBrand}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveBrand}
      />
      <StatusModal
        open={statusModal.open}
        onOpenChange={(open) => setStatusModal({ ...statusModal, open })}
        title={statusModal.title}
        description={statusModal.description}
        status={statusModal.status}
      />
    </div>
  );
}
