'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Ticket,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  AlertCircle,
  Calendar,
  Percent,
  DollarSign,
} from 'lucide-react';
import { CouponDialog, Coupon } from '@/components/admin/coupon-dialog';
import { useToast } from '@/components/hooks/use-toast';
import { useAuth } from '@/hooks/useApi';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, isInitialized } = useAuth();

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      const response = await fetch('/api/coupons', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch coupons');
      }
      
      setCoupons(result.data || []);
    } catch (err) {
      console.error('Error fetching coupons:', err);
      setError(err instanceof Error ? err.message : 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      fetchCoupons();
    }
  }, [isInitialized, isAuthenticated]);

  const handleSaveCoupon = async (couponData: Partial<Coupon>) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) {
      toast({ title: 'Error', description: 'Not authenticated', variant: 'destructive' });
      return;
    }

    try {
      if (selectedCoupon && selectedCoupon.id) {
        // Update
        const response = await fetch(`/api/coupons/${selectedCoupon.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(couponData),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Failed to update coupon');
        }

        toast({ title: 'Success', description: 'Coupon updated successfully' });
      } else {
        // Create
        const response = await fetch('/api/coupons', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(couponData),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Failed to create coupon');
        }

        toast({ title: 'Success', description: 'Coupon created successfully' });
      }

      setDialogOpen(false);
      setSelectedCoupon(undefined);
      await fetchCoupons();
    } catch (err: any) {
      toast({ 
        title: 'Error', 
        description: err.message || 'Failed to save coupon', 
        variant: 'destructive' 
      });
      throw err;
    }
  };

  const handleDeleteCoupon = async () => {
    if (!couponToDelete || !couponToDelete.id) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) {
      toast({ title: 'Error', description: 'Not authenticated', variant: 'destructive' });
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/coupons/${couponToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete coupon');
      }

      toast({ title: 'Success', description: 'Coupon deleted successfully' });
      setDeleteDialogOpen(false);
      setCouponToDelete(null);
      await fetchCoupons();
    } catch (err: any) {
      toast({ 
        title: 'Error', 
        description: err.message || 'Failed to delete coupon', 
        variant: 'destructive' 
      });
    } finally {
      setDeleting(false);
    }
  };

  const filteredCoupons = coupons.filter(coupon => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!coupon.code.toLowerCase().includes(query) &&
          !(coupon.description && coupon.description.toLowerCase().includes(query))) {
        return false;
      }
    }

    if (statusFilter === 'active' && !coupon.isActive) return false;
    if (statusFilter === 'inactive' && coupon.isActive) return false;

    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const stats = {
    total: coupons.length,
    active: coupons.filter(c => c.isActive).length,
    inactive: coupons.filter(c => !c.isActive).length,
    used: coupons.reduce((sum, c) => sum + (c.currentUses || 0), 0),
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Ticket className="w-7 h-7 text-primary" />
            Coupon Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage discount coupons
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={fetchCoupons} variant="outline" className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => {
            setSelectedCoupon(undefined);
            setDialogOpen(true);
          }} className="gap-2">
            <Plus className="w-4 h-4" />
            New Coupon
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Ticket className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
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
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-500/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Uses</p>
                <p className="text-2xl font-bold text-blue-600">{stats.used}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
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
            placeholder="Search by code or description..."
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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <p className="text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchCoupons} className="ml-auto">
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

      {/* Coupons List */}
      {!loading && !error && (
        <div className="space-y-4">
          {filteredCoupons.length === 0 ? (
            <Card className="bg-card border-border/50">
              <CardContent className="p-12 text-center">
                <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Coupons Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Create your first coupon to get started'}
                </p>
                {!searchQuery && statusFilter === 'all' && (
                  <Button onClick={() => {
                    setSelectedCoupon(undefined);
                    setDialogOpen(true);
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Coupon
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredCoupons.map((coupon) => {
                const isExpired = coupon.validUntil 
                  ? new Date(coupon.validUntil) < new Date() 
                  : false;
                const isUsageLimitReached = coupon.maxUses 
                  ? (coupon.currentUses || 0) >= coupon.maxUses 
                  : false;

                return (
                  <Card key={coupon.id} className="bg-card border-border/50 hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Coupon Info */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-lg font-bold text-primary">
                              {coupon.code}
                            </span>
                            <Badge className={coupon.isActive ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-gray-500/10 text-gray-600 border-gray-500/20'}>
                              {coupon.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {isExpired && (
                              <Badge variant="outline" className="text-red-600 border-red-500/20">
                                Expired
                              </Badge>
                            )}
                            {isUsageLimitReached && (
                              <Badge variant="outline" className="text-orange-600 border-orange-500/20">
                                Limit Reached
                              </Badge>
                            )}
                          </div>
                          
                          {coupon.description && (
                            <p className="text-sm text-muted-foreground">{coupon.description}</p>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                            <span className="flex items-center gap-1 text-foreground">
                              {coupon.discountType === 'percentage' ? (
                                <>
                                  <Percent className="w-3 h-3" />
                                  {coupon.discountValue}% OFF
                                </>
                              ) : (
                                <>
                                  <DollarSign className="w-3 h-3" />
                                  AED {coupon.discountValue} OFF
                                </>
                              )}
                            </span>
                            {coupon.minDays && (
                              <>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-muted-foreground">Min {coupon.minDays} days</span>
                              </>
                            )}
                            {coupon.minPrice && (
                              <>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-muted-foreground">Min AED {coupon.minPrice.toLocaleString()}</span>
                              </>
                            )}
                            {(coupon.applicableCarModels?.length || 0) > 0 && (
                              <>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-muted-foreground">{coupon.applicableCarModels?.length} model(s)</span>
                              </>
                            )}
                            {(coupon.applicableBrands?.length || 0) > 0 && (
                              <>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-muted-foreground">{coupon.applicableBrands?.length} brand(s)</span>
                              </>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Valid from {formatDate(coupon.validFrom)}
                            </span>
                            {coupon.validUntil && (
                              <>
                                <span>•</span>
                                <span>Until {formatDate(coupon.validUntil)}</span>
                              </>
                            )}
                            {coupon.maxUses && (
                              <>
                                <span>•</span>
                                <span>Used {coupon.currentUses || 0} / {coupon.maxUses}</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2 lg:flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCoupon(coupon);
                              setDialogOpen(true);
                            }}
                            className="gap-1"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCouponToDelete(coupon);
                              setDeleteDialogOpen(true);
                            }}
                            className="gap-1 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Coupon Dialog */}
      <CouponDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        coupon={selectedCoupon}
        onSave={handleSaveCoupon}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Coupon</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete coupon <strong>{couponToDelete?.code}</strong>? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setCouponToDelete(null);
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCoupon}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
