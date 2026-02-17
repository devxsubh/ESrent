'use client';

import { useEffect, useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Loader2, X, Check, ChevronDown, Search } from 'lucide-react';
import { useToast } from '@/components/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface Coupon {
  id?: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minDays?: number;
  minPrice?: number;
  applicableCarModels?: string[];
  applicableBrands?: string[];
  maxUses?: number;
  maxUsesPerUser?: number;
  isActive: boolean;
  validFrom: string;
  validUntil?: string;
  currentUses?: number;
}

interface CouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon?: Coupon;
  onSave: (coupon: Partial<Coupon>) => Promise<void>;
}

export function CouponDialog({ open, onOpenChange, coupon, onSave }: CouponDialogProps) {
  const [formData, setFormData] = useState<Partial<Coupon>>({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    minDays: undefined,
    minPrice: undefined,
    applicableCarModels: [],
    applicableBrands: [],
    maxUses: undefined,
    maxUsesPerUser: undefined,
    isActive: true,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: undefined,
  });
  
  const [carModelInput, setCarModelInput] = useState('');
  const [brandInput, setBrandInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [carModelsOpen, setCarModelsOpen] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const [applyForAllCars, setApplyForAllCars] = useState(false);
  const [applyForAllBrands, setApplyForAllBrands] = useState(false);
  
  // Data fetching
  const [carModels, setCarModels] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(false);
  
  const { toast } = useToast();

  // Fetch car models
  useEffect(() => {
    if (open) {
      fetchCarModels();
      fetchBrands();
    }
  }, [open]);

  const fetchCarModels = async () => {
    setLoadingModels(true);
    try {
      const response = await fetch('/api/cars/list?limit=1000');
      const result = await response.json();
      if (result.success && result.data) {
        // Extract unique car model names (using 'name' field)
        const uniqueModels = [...new Set(result.data.map((car: any) => car.name).filter(Boolean))];
        setCarModels(uniqueModels.sort());
      }
    } catch (error) {
      console.error('Error fetching car models:', error);
    } finally {
      setLoadingModels(false);
    }
  };

  const fetchBrands = async () => {
    setLoadingBrands(true);
    try {
      const response = await fetch('/api/brands?limit=1000');
      const result = await response.json();
      if (result.data) {
        // Extract unique brand names
        const uniqueBrands = [...new Set(result.data.map((brand: any) => brand.name).filter(Boolean))];
        setBrands(uniqueBrands.sort());
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoadingBrands(false);
    }
  };

  // Filtered options based on input
  const filteredCarModels = useMemo(() => {
    if (!carModelInput.trim()) return carModels.slice(0, 10);
    return carModels
      .filter(model => model.toLowerCase().includes(carModelInput.toLowerCase()))
      .slice(0, 10);
  }, [carModelInput, carModels]);

  const filteredBrands = useMemo(() => {
    if (!brandInput.trim()) return brands.slice(0, 10);
    return brands
      .filter(brand => brand.toLowerCase().includes(brandInput.toLowerCase()))
      .slice(0, 10);
  }, [brandInput, brands]);

  useEffect(() => {
    if (open) {
      if (coupon) {
        setFormData({
          ...coupon,
          validFrom: coupon.validFrom ? coupon.validFrom.split('T')[0] : new Date().toISOString().split('T')[0],
          validUntil: coupon.validUntil ? coupon.validUntil.split('T')[0] : undefined,
        });
        setCarModelInput('');
        setBrandInput('');
        setApplyForAllCars(false);
        setApplyForAllBrands(false);
      } else {
        setFormData({
          code: '',
          description: '',
          discountType: 'percentage',
          discountValue: 0,
          minDays: undefined,
          minPrice: undefined,
          applicableCarModels: [],
          applicableBrands: [],
          maxUses: undefined,
          maxUsesPerUser: undefined,
          isActive: true,
          validFrom: new Date().toISOString().split('T')[0],
          validUntil: undefined,
        });
        setCarModelInput('');
        setBrandInput('');
        setApplyForAllCars(false);
        setApplyForAllBrands(false);
      }
      setError(null);
    }
  }, [open, coupon]);

  // Handle "Apply for all" checkbox
  useEffect(() => {
    if (applyForAllCars) {
      setFormData(prev => ({
        ...prev,
        applicableCarModels: [],
      }));
      setCarModelInput('');
    }
  }, [applyForAllCars]);

  useEffect(() => {
    if (applyForAllBrands) {
      setFormData(prev => ({
        ...prev,
        applicableBrands: [],
      }));
      setBrandInput('');
    }
  }, [applyForAllBrands]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.code || formData.code.trim() === '') {
      setError('Coupon code is required');
      return;
    }

    if (formData.discountValue === undefined || formData.discountValue < 0) {
      setError('Discount value is required and must be greater than or equal to 0');
      return;
    }

    if (formData.discountType === 'percentage' && (formData.discountValue < 0 || formData.discountValue > 100)) {
      setError('Percentage discount must be between 0 and 100');
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare data - if "Apply for all" is checked, send empty arrays (or undefined)
      const dataToSave = {
        ...formData,
        applicableCarModels: applyForAllCars ? [] : formData.applicableCarModels,
        applicableBrands: applyForAllBrands ? [] : formData.applicableBrands,
      };
      
      await onSave(dataToSave);
      onOpenChange(false);
      toast({
        title: 'Success',
        description: coupon ? 'Coupon updated successfully' : 'Coupon created successfully',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save coupon');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectCarModel = (model: string) => {
    if (!formData.applicableCarModels?.includes(model)) {
      setFormData({
        ...formData,
        applicableCarModels: [...(formData.applicableCarModels || []), model],
      });
    }
    setCarModelInput('');
    setCarModelsOpen(false);
  };

  const removeCarModel = (model: string) => {
    setFormData({
      ...formData,
      applicableCarModels: formData.applicableCarModels?.filter(m => m !== model) || [],
    });
  };

  const selectBrand = (brand: string) => {
    if (!formData.applicableBrands?.includes(brand)) {
      setFormData({
        ...formData,
        applicableBrands: [...(formData.applicableBrands || []), brand],
      });
    }
    setBrandInput('');
    setBrandsOpen(false);
  };

  const removeBrand = (brand: string) => {
    setFormData({
      ...formData,
      applicableBrands: formData.applicableBrands?.filter(b => b !== brand) || [],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{coupon ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
          <DialogDescription>
            {coupon ? 'Update coupon details and conditions' : 'Create a new discount coupon with conditions'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code *</Label>
                <Input
                  id="code"
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="SUMMER2024"
                  required
                  disabled={!!coupon}
                />
                <p className="text-xs text-muted-foreground">Code will be converted to uppercase</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="isActive">Status</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive ?? true}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Summer promotion discount"
                rows={2}
              />
            </div>
          </div>

          {/* Discount Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Discount Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountType">Discount Type *</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(value: 'percentage' | 'fixed') => 
                    setFormData({ ...formData, discountType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (AED)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountValue">
                  Discount Value * 
                  {formData.discountType === 'percentage' ? ' (%)' : ' (AED)'}
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  value={formData.discountValue ?? ''}
                  onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                  min={0}
                  max={formData.discountType === 'percentage' ? 100 : undefined}
                  required
                />
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Conditions (Optional)</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minDays">Minimum Days</Label>
                <Input
                  id="minDays"
                  type="number"
                  value={formData.minDays ?? ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    minDays: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  min={1}
                  placeholder="e.g., 3"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minPrice">Minimum Price (AED)</Label>
                <Input
                  id="minPrice"
                  type="number"
                  value={formData.minPrice ?? ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    minPrice: e.target.value ? parseFloat(e.target.value) : undefined 
                  })}
                  min={0}
                  placeholder="e.g., 500"
                />
              </div>
            </div>

            {/* Applicable Car Models */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Applicable Car Models</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="applyForAllCars"
                    checked={applyForAllCars}
                    onCheckedChange={(checked) => {
                      setApplyForAllCars(checked as boolean);
                    }}
                  />
                  <Label htmlFor="applyForAllCars" className="text-sm font-normal cursor-pointer">
                    Apply for all cars
                  </Label>
                </div>
              </div>
              
              {!applyForAllCars && (
                <>
                  <Popover open={carModelsOpen} onOpenChange={setCarModelsOpen}>
                    <PopoverTrigger asChild>
                      <div className="relative">
                        <Input
                          value={carModelInput}
                          onChange={(e) => {
                            setCarModelInput(e.target.value);
                            setCarModelsOpen(true);
                          }}
                          onFocus={() => setCarModelsOpen(true)}
                          placeholder="Search and select car models..."
                          className="pr-8"
                        />
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      <div className="p-2">
                        {loadingModels ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-4 h-4 animate-spin" />
                          </div>
                        ) : filteredCarModels.length === 0 ? (
                          <div className="py-4 text-sm text-muted-foreground text-center">
                            No car models found
                          </div>
                        ) : (
                          <div className="max-h-[200px] overflow-y-auto">
                            {filteredCarModels.map((model) => (
                              <button
                                key={model}
                                type="button"
                                onClick={() => selectCarModel(model)}
                                className={cn(
                                  "w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent flex items-center justify-between",
                                  formData.applicableCarModels?.includes(model) && "bg-accent"
                                )}
                              >
                                <span>{model}</span>
                                {formData.applicableCarModels?.includes(model) && (
                                  <Check className="w-4 h-4 text-primary" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  {formData.applicableCarModels && formData.applicableCarModels.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.applicableCarModels.map((model) => (
                        <div
                          key={model}
                          className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                        >
                          {model}
                          <button
                            type="button"
                            onClick={() => removeCarModel(model)}
                            className="hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              {applyForAllCars && (
                <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                  Coupon will apply to all car models
                </div>
              )}
            </div>

            {/* Applicable Brands */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Applicable Brands</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="applyForAllBrands"
                    checked={applyForAllBrands}
                    onCheckedChange={(checked) => {
                      setApplyForAllBrands(checked as boolean);
                    }}
                  />
                  <Label htmlFor="applyForAllBrands" className="text-sm font-normal cursor-pointer">
                    Apply for all brands
                  </Label>
                </div>
              </div>
              
              {!applyForAllBrands && (
                <>
                  <Popover open={brandsOpen} onOpenChange={setBrandsOpen}>
                    <PopoverTrigger asChild>
                      <div className="relative">
                        <Input
                          value={brandInput}
                          onChange={(e) => {
                            setBrandInput(e.target.value);
                            setBrandsOpen(true);
                          }}
                          onFocus={() => setBrandsOpen(true)}
                          placeholder="Search and select brands..."
                          className="pr-8"
                        />
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      <div className="p-2">
                        {loadingBrands ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-4 h-4 animate-spin" />
                          </div>
                        ) : filteredBrands.length === 0 ? (
                          <div className="py-4 text-sm text-muted-foreground text-center">
                            No brands found
                          </div>
                        ) : (
                          <div className="max-h-[200px] overflow-y-auto">
                            {filteredBrands.map((brand) => (
                              <button
                                key={brand}
                                type="button"
                                onClick={() => selectBrand(brand)}
                                className={cn(
                                  "w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent flex items-center justify-between",
                                  formData.applicableBrands?.includes(brand) && "bg-accent"
                                )}
                              >
                                <span>{brand}</span>
                                {formData.applicableBrands?.includes(brand) && (
                                  <Check className="w-4 h-4 text-primary" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  {formData.applicableBrands && formData.applicableBrands.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.applicableBrands.map((brand) => (
                        <div
                          key={brand}
                          className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                        >
                          {brand}
                          <button
                            type="button"
                            onClick={() => removeBrand(brand)}
                            className="hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              {applyForAllBrands && (
                <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                  Coupon will apply to all brands
                </div>
              )}
            </div>
          </div>

          {/* Usage Limits */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Usage Limits (Optional)</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxUses">Maximum Total Uses</Label>
                <Input
                  id="maxUses"
                  type="number"
                  value={formData.maxUses ?? ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    maxUses: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  min={1}
                  placeholder="e.g., 100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxUsesPerUser">Max Uses Per User</Label>
                <Input
                  id="maxUsesPerUser"
                  type="number"
                  value={formData.maxUsesPerUser ?? ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    maxUsesPerUser: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  min={1}
                  placeholder="e.g., 1"
                />
              </div>
            </div>
          </div>

          {/* Validity Period */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Validity Period</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validFrom">Valid From *</Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={formData.validFrom || ''}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validUntil">Valid Until (Optional)</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={formData.validUntil || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    validUntil: e.target.value || undefined 
                  })}
                  min={formData.validFrom}
                />
              </div>
            </div>
          </div>

          {/* Usage Stats (if editing) */}
          {coupon && coupon.currentUses !== undefined && (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">
                This coupon has been used <span className="font-semibold">{coupon.currentUses}</span> time(s)
                {coupon.maxUses && ` out of ${coupon.maxUses} maximum`}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                coupon ? 'Update Coupon' : 'Create Coupon'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
