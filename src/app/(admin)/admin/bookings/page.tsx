"use client";

import React, { useState, useEffect } from 'react';
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
  CalendarCheck,
  Search,
  Filter,
  Eye,
  Phone,
  Mail,
  MapPin,
  Car,
  Calendar,
  DollarSign,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Truck
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

interface Booking {
  id: string;
  _id?: string;
  visibleId: string;
  carId: string;
  carName: string;
  carImage?: string;
  pricePerDay: number;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  pickupLocation: string;
  deliveryRequired: boolean;
  deliveryAddress?: string;
  fullName: string;
  phone: string;
  email?: string;
  nationality: string;
  licenseType: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

const statusConfig = {
  pending: { 
    label: 'Pending', 
    color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    icon: Clock 
  },
  confirmed: { 
    label: 'Confirmed', 
    color: 'bg-green-500/10 text-green-600 border-green-500/20',
    icon: CheckCircle 
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'bg-red-500/10 text-red-600 border-red-500/20',
    icon: XCircle 
  },
  completed: { 
    label: 'Completed', 
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    icon: CheckCircle 
  },
};

const pickupLocationLabels: Record<string, string> = {
  'airport': 'Dubai Airport (DXB)',
  'marina': 'Dubai Marina',
  'jlt': 'JLT',
  'downtown': 'Downtown Dubai',
  'business-bay': 'Business Bay',
  'palm-jumeirah': 'Palm Jumeirah',
  'other': 'Other Location',
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const response = await fetch(`/api/bookings?${params.toString()}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch bookings');
      }
      
      setBookings(result.data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      setUpdatingStatus(bookingId);
      
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      // Refresh bookings
      await fetchBookings();
      
      // Update selected booking if open
      if (selectedBooking && (selectedBooking.id === bookingId || selectedBooking._id === bookingId)) {
        setSelectedBooking(prev => prev ? { ...prev, status: newStatus as Booking['status'] } : null);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update booking status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      booking.visibleId.toLowerCase().includes(query) ||
      booking.fullName.toLowerCase().includes(query) ||
      booking.phone.includes(query) ||
      booking.carName.toLowerCase().includes(query) ||
      (booking.email && booking.email.toLowerCase().includes(query))
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const openWhatsApp = (phone: string, booking: Booking) => {
    const message = encodeURIComponent(
      `Hi ${booking.fullName}!\n\n` +
      `Regarding your booking (${booking.visibleId}) for ${booking.carName}:\n` +
      `📅 ${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}\n` +
      `💰 Total: AED ${booking.totalPrice.toLocaleString()}\n\n` +
      `How can we help you?`
    );
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  };

  // Stats
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarCheck className="w-7 h-7 text-primary" />
            Booking Requests
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all customer bookings
          </p>
        </div>
        
        <Button onClick={fetchBookings} variant="outline" className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
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
                <CalendarCheck className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
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
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
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
            placeholder="Search by ID, name, phone, car..."
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
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <p className="text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchBookings} className="ml-auto">
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

      {/* Bookings List */}
      {!loading && !error && (
        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <Card className="bg-card border-border/50">
              <CardContent className="p-12 text-center">
                <CalendarCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Bookings Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'No booking requests yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredBookings.map((booking) => {
              const StatusIcon = statusConfig[booking.status].icon;
              
              return (
                <Card key={booking.id || booking._id} className="bg-card border-border/50 hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Car Image */}
                      <div className="w-full lg:w-24 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {booking.carImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={booking.carImage}
                            alt={booking.carName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Car className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      
                      {/* Booking Info */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm text-primary font-semibold">
                            {booking.visibleId}
                          </span>
                          <Badge className={statusConfig[booking.status].color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig[booking.status].label}
                          </Badge>
                          {booking.deliveryRequired && (
                            <Badge variant="outline" className="gap-1">
                              <Truck className="w-3 h-3" />
                              Delivery
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                          <span className="font-medium text-foreground">{booking.carName}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="font-semibold text-primary">
                            AED {booking.totalPrice.toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {booking.fullName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {booking.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {pickupLocationLabels[booking.pickupLocation] || booking.pickupLocation}
                          </span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2 lg:flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openWhatsApp(booking.phone, booking)}
                          className="gap-1 text-green-600 border-green-500/30 hover:bg-green-500/10"
                        >
                          <FaWhatsapp className="w-4 h-4" />
                          WhatsApp
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setIsDetailsOpen(true);
                          }}
                          className="gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                        
                        {booking.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => updateBookingStatus(booking.id || booking._id || '', 'confirmed')}
                            disabled={updatingStatus === (booking.id || booking._id)}
                            className="gap-1 bg-green-600 hover:bg-green-700"
                          >
                            {updatingStatus === (booking.id || booking._id) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            Confirm
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Booking Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-primary" />
              Booking Details
            </DialogTitle>
            <DialogDescription>
              {selectedBooking?.visibleId}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <Badge className={`${statusConfig[selectedBooking.status].color} text-sm px-3 py-1`}>
                  {statusConfig[selectedBooking.status].label}
                </Badge>
                
                <Select
                  value={selectedBooking.status}
                  onValueChange={(value) => updateBookingStatus(
                    selectedBooking.id || selectedBooking._id || '',
                    value
                  )}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Car Info */}
              <div className="bg-accent/30 rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Car className="w-4 h-4 text-primary" />
                  Vehicle
                </h4>
                <div className="flex items-center gap-4">
                  {selectedBooking.carImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedBooking.carImage}
                      alt={selectedBooking.carName}
                      className="w-24 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <p className="font-medium text-foreground">{selectedBooking.carName}</p>
                    <p className="text-sm text-muted-foreground">
                      AED {selectedBooking.pricePerDay.toLocaleString()} / day
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Rental Period */}
              <div className="bg-accent/30 rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Rental Period
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Start Date</p>
                    <p className="font-medium">{formatDate(selectedBooking.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">End Date</p>
                    <p className="font-medium">{formatDate(selectedBooking.endDate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Days</p>
                    <p className="font-medium">{selectedBooking.totalDays} days</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Price</p>
                    <p className="font-bold text-primary text-lg">
                      AED {selectedBooking.totalPrice.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Location */}
              <div className="bg-accent/30 rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Pickup Location
                </h4>
                <p className="font-medium">
                  {pickupLocationLabels[selectedBooking.pickupLocation] || selectedBooking.pickupLocation}
                </p>
                {selectedBooking.deliveryRequired && (
                  <div className="mt-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-sm font-medium text-blue-600 flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Delivery Requested
                    </p>
                    {selectedBooking.deliveryAddress && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedBooking.deliveryAddress}
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Customer Info */}
              <div className="bg-accent/30 rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Customer Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Full Name</p>
                    <p className="font-medium">{selectedBooking.fullName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedBooking.phone}</p>
                  </div>
                  {selectedBooking.email && (
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedBooking.email}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Nationality</p>
                    <p className="font-medium">{selectedBooking.nationality}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">License Type</p>
                    <p className="font-medium capitalize">{selectedBooking.licenseType}</p>
                  </div>
                </div>
              </div>
              
              {/* Notes */}
              {selectedBooking.notes && (
                <div className="bg-accent/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Customer Notes</h4>
                  <p className="text-sm text-muted-foreground">{selectedBooking.notes}</p>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => openWhatsApp(selectedBooking.phone, selectedBooking)}
                  className="flex-1 gap-2 text-green-600 border-green-500/30 hover:bg-green-500/10"
                >
                  <FaWhatsapp className="w-5 h-5" />
                  Contact on WhatsApp
                </Button>
                
                {selectedBooking.email && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(`mailto:${selectedBooking.email}`, '_blank')}
                    className="flex-1 gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    Send Email
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}






