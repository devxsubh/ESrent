'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Pencil, Trash2, Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Car, TrendingUp, CheckCircle, XCircle, RefreshCw, Search, Filter, Loader2 } from 'lucide-react';
import { Car as CarType } from '@/types/car';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CarDialog } from '@/components/admin/car-dialog';
import { StatusModal } from '@/components/admin/status-modal';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { useToast } from '@/components/hooks/use-toast';
import { useAuth } from '@/hooks/useApi';

export default function AdminCars() {
  const { token } = useAuth();
  const [cars, setCars] = useState<CarType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ error: string; details?: string } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarType | undefined>();
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
  const [totalCars, setTotalCars] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Stats state for total data
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    featured: 0,
    unavailable: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  
  const { toast } = useToast();

  const fetchCars = async (page: number = currentPage) => {
    try {
      setError(null);
      setLoading(true);
      
      // Fetch from API route with pagination
      // console.log(`Fetching cars from /api/cars?page=${page}&limit=${pageSize}...`);
      const res = await fetch(`/api/cars?page=${page}&limit=${pageSize}`);
      const data = await res.json();
      // console.log('Raw /api/cars response:', data);
      
      let carsArray: CarType[] = [];
      if (data.data && Array.isArray(data.data)) {
        carsArray = data.data;
        setTotalCars(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.page || page);
      } else if (Array.isArray(data)) {
        carsArray = data;
        setTotalCars(carsArray.length);
        setTotalPages(1);
        setCurrentPage(1);
      } else if (data.cars && Array.isArray(data.cars)) {
        carsArray = data.cars;
        setTotalCars(data.total || carsArray.length);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.page || 1);
      }
      
      setCars([...carsArray]);
    } catch (error) {
      console.error('Error fetching cars:', error);
      setError({
        error: 'Failed to fetch cars',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch total stats from all cars
  const fetchTotalStats = async () => {
    try {
      setStatsLoading(true);
      const res = await fetch('/api/cars?limit=1000'); // Get all cars for stats
      const data = await res.json();
      
      let allCars: CarType[] = [];
      if (data.data && Array.isArray(data.data)) {
        allCars = data.data;
      } else if (Array.isArray(data)) {
        allCars = data;
      } else if (data.cars && Array.isArray(data.cars)) {
        allCars = data.cars;
      }

      // Calculate stats from all cars
      const total = allCars.length;
      const available = allCars.filter(car => car.available).length;
      const featured = allCars.filter(car => car.featured).length;
      const unavailable = allCars.filter(car => !car.available).length;

      setStats({
        total,
        available,
        featured,
        unavailable,
      });
    } catch (error) {
      console.error('Error fetching total stats:', error);
      // Fallback to current page data
      setStats({
        total: cars.length,
        available: cars.filter(car => car.available).length,
        featured: cars.filter(car => car.featured).length,
        unavailable: cars.filter(car => !car.available).length,
      });
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchCars(1);
  }, []);

  useEffect(() => {
    fetchTotalStats();
  }, []);

  // Pagination control functions
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchCars(page);
    }
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handleAddCar = () => {
    setSelectedCar(undefined);
    setDialogOpen(true);
  };

  const handleEditCar = (car: CarType) => {
    setSelectedCar(car);
    setDialogOpen(true);
  };

  const handleDeleteCar = async (car: CarType) => {
    if (!window.confirm('Are you sure you want to delete this car?')) return;

    try {
      if (!token) throw new Error('Not authenticated');
      const res = await fetch(`/api/cars/${car.id}`, {
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
        title: 'Car deleted',
        description: `${car.name} has been deleted successfully.`,
      });
      fetchCars(currentPage);
      fetchTotalStats(); // Refresh stats after deletion
    } catch (error) {
      console.error('Error deleting car:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete car. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveCar = async (carData: Partial<CarType>) => {
    try {
      if (!token) throw new Error('Not authenticated');
      if (selectedCar) {
        const res = await fetch(`/api/cars/${selectedCar.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(carData),
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const errorMessage = errorData.error || `HTTP error! status: ${res.status}`;
          
          // Handle specific error cases
          if (res.status === 400) {
            throw new Error(`Validation Error: ${errorMessage}`);
          } else if (res.status === 404) {
            throw new Error('Car not found. It may have been deleted by another user.');
          } else if (res.status === 401) {
            throw new Error('Authentication expired. Please log in again.');
          } else if (res.status === 403) {
            throw new Error('You do not have permission to update this car.');
          } else if (res.status === 409) {
            throw new Error('Car name already exists. Please choose a different name.');
          } else {
            throw new Error(`Update failed: ${errorMessage}`);
          }
        }
        
        const updatedCar = await res.json();
        setCars(prevCars => 
          prevCars.map(car => 
            car.id === selectedCar.id ? { ...car, ...updatedCar } : car
          )
        );
      } else {
        // Ensure carData matches CreateCarData type
        const requiredFields: (keyof CarType)[] = ['brand', 'model', 'name', 'originalPrice', 'images', 'carTypeIds'];
        for (const field of requiredFields) {
          const fieldValue = carData[field];
          if (!fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0)) {
            throw new Error(`Missing required field: ${field}`);
          }
        }
        
        const res = await fetch('/api/cars', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(carData),
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
            throw new Error('You do not have permission to create cars.');
          } else if (res.status === 409) {
            throw new Error('Car name already exists. Please choose a different name.');
          } else if (res.status === 413) {
            throw new Error('Car data is too large. Please reduce the number of images or description length.');
          } else {
            throw new Error(`Creation failed: ${errorMessage}`);
          }
        }
        
        const createdCar = await res.json();
        setCars(prevCars => [...prevCars, createdCar]);
      }

      // Close dialog and show success message
      setDialogOpen(false);
      setSelectedCar(undefined);
      setStatusModal({
        open: true,
        title: selectedCar ? 'Car Updated' : 'Car Added',
        description: `${carData.name} has been ${selectedCar ? 'updated' : 'added'} successfully.`,
        status: 'success',
      });

      // Fetch fresh data in the background
      fetchCars(currentPage);
      fetchTotalStats(); // Refresh stats after save
    } catch (error) {
      console.error('Error saving car:', error);
      
      // Extract specific error message
      let errorMessage = 'Failed to save car. Please try again.';
      
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

  const filteredCars = cars.filter(car => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      car.name.toLowerCase().includes(query) ||
      (car.brand && car.brand.toLowerCase().includes(query)) ||
      (car.model && car.model.toLowerCase().includes(query))
    );
  }).filter(car => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'available') return car.available;
    if (statusFilter === 'unavailable') return !car.available;
    if (statusFilter === 'featured') return car.featured;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Car className="w-7 h-7 text-primary" />
            Cars Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your car inventory and listings
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => fetchCars(currentPage)} variant="outline" className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={handleAddCar}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Car
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Cars</p>
                <p className="text-2xl font-bold text-foreground">
                  {statsLoading ? '...' : stats.total}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Car className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-green-600">
                  {statsLoading ? '...' : stats.available}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Featured</p>
                <p className="text-2xl font-bold text-blue-600">
                  {statsLoading ? '...' : stats.featured}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unavailable</p>
                <p className="text-2xl font-bold text-red-600">
                  {statsLoading ? '...' : stats.unavailable}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
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
            placeholder="Search by name, brand, model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="unavailable">Unavailable</SelectItem>
            <SelectItem value="featured">Featured</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <p className="text-destructive">{error.error}</p>
          <Button variant="outline" size="sm" onClick={() => fetchCars(currentPage)} className="ml-auto">
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
                  <TableHead className="text-muted-foreground">Image</TableHead>
                  <TableHead className="text-muted-foreground">Name</TableHead>
                  <TableHead className="text-muted-foreground">Brand</TableHead>
                  <TableHead className="text-muted-foreground">Category</TableHead>
                  <TableHead className="text-muted-foreground">Price</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCars.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Cars Found</h3>
                      <p className="text-muted-foreground">
                        {searchQuery || statusFilter !== 'all'
                          ? 'Try adjusting your search or filters'
                          : 'Get started by adding your first car.'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCars.map((car: CarType, index: number) => (
                    <TableRow key={car.id || `car-${index}`} className="border-border/50 hover:bg-accent/50 transition-colors">
                      <TableCell>
                        {car.images && car.images.length > 0 && car.images[0] && car.images[0].trim() !== '' ? (
                          <div className="relative w-16 h-16 rounded-md overflow-hidden">
                            <Image
                              src={car.images[0]}
                              alt={car.name}
                              fill
                              className="object-cover transition-transform hover:scale-110"
                              sizes="64px"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                            <span className="text-muted-foreground text-xs">No image</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{car.name}</TableCell>
                      <TableCell>
                        {car.brandId && typeof car.brandId === 'object' ? (
                          <div className="flex items-center gap-2">
                            {(car.brandId as { logo: string; name: string }).logo && (car.brandId as { logo: string; name: string }).logo.trim() !== '' ? (
                              <Image
                                src={(car.brandId as { logo: string; name: string }).logo}
                                alt={(car.brandId as { logo: string; name: string }).name}
                                width={24}
                                height={24}
                                className="rounded-full"
                              />
                            ) : null}
                            <span>{(car.brandId as { logo: string; name: string }).name}</span>
                          </div>
                        ) : (
                          car.brand
                        )}
                      </TableCell>
                      <TableCell>
                        {/* Show first car type name if available, else fallback */}
                        {Array.isArray(car.carTypeIds) && car.carTypeIds.length > 0
                          ? (typeof car.carTypeIds[0] === 'string' 
                              ? car.carTypeIds[0] 
                              : car.carTypeIds[0]?.name || 'N/A')
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {car.discountedPrice && car.originalPrice ? (
                          <div className="flex flex-col">
                            <span className="text-green-500 font-medium">AED {car.discountedPrice.toLocaleString()}</span>
                            <span className="text-muted-foreground text-sm line-through">AED {car.originalPrice.toLocaleString()}</span>
                          </div>
                        ) : car.originalPrice ? (
                          <span className="font-medium">AED {car.originalPrice.toLocaleString()}</span>
                        ) : (
                          <span className="text-muted-foreground">Price on request</span>
                        )}/day
                      </TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          car.available
                            ? 'bg-green-500/20 text-green-600 dark:text-green-400' 
                            : 'bg-red-500/20 text-red-600 dark:text-red-400'
                        }`}>
                          {car.available ? 'Available' : 'Unavailable'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditCar(car)}
                            className="transition-colors hover:bg-primary hover:text-primary-foreground border-border/50"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteCar(car)}
                            className="transition-colors hover:bg-destructive hover:text-destructive-foreground border-border/50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              {/* Page Info */}
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCars)} of {totalCars} cars
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

      <CarDialog
        car={selectedCar}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveCar}
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
