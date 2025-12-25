'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Car, PopulatedCategory } from '@/types/car';
import { Brand } from '@/types/brand';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { uploadImage } from '@/lib/cloudinary';
import { Image as ImageIcon, X, Loader2, Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Image from 'next/image';
import { useBrands, useCategories } from '@/hooks/useApi';
import { Category } from '@/types/category';
import { useToast } from '@/components/hooks/use-toast';
import { FormErrorDisplay, FieldError } from '@/components/ui/form-error';
import { useApiError } from '@/hooks/useApiError';
import { useFormValidation } from '@/hooks/useFormValidation';
import { commonValidationRules } from '@/components/ui/form-validation';

interface CarDialogProps {
  car?: Car;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (car: Partial<Car>) => Promise<void>;
}

const defaultCar: Partial<Car> = {
  name: '',
  brand: '',
  model: '',
  // year: new Date().getFullYear(),
  // mileage: 0,
  originalPrice: 0,
  discountedPrice: 0,
  images: [],
  description: '',
  keywords: [],
  features: [],
  available: true,
  featured: false,
};

export function CarDialog({ car, open, onOpenChange, onSave }: CarDialogProps) {
  const [uploading, setUploading] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>(car?.images || []);
  const [coverImageIndex, setCoverImageIndex] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { error: apiError, handleApiError, clearError: clearApiError } = useApiError();

  // Helper function to extract ID from string or PopulatedCategory
  const getId = (item: string | PopulatedCategory | undefined): string => {
    if (!item) return '';
    return typeof item === 'string' ? item : item.id || '';
  };

  const validationRules = {
    name: {
      ...commonValidationRules.required('Car name is required'),
      ...commonValidationRules.minLength(2, 'Car name must be at least 2 characters'),
      ...commonValidationRules.maxLength(100, 'Car name must be no more than 100 characters')
    },
    brand: {
      ...commonValidationRules.required('Brand is required')
    },
    model: {
      ...commonValidationRules.required('Model is required'),
      ...commonValidationRules.minLength(1, 'Model must be at least 1 character'),
      ...commonValidationRules.maxLength(50, 'Model must be no more than 50 characters')
    },
    originalPrice: {
      ...commonValidationRules.required('Original price is required'),
      ...commonValidationRules.positiveNumber('Original price must be greater than 0')
    },
    discountedPrice: {
      custom: (value: unknown) => {
        if (value && typeof value === 'number' && value > 0) {
          // This will be validated against originalPrice in the form validation
          return null;
        }
        return null; // Optional field
      }
    },
    carTypeIds: {
      custom: (value: unknown) => {
        if (!value || !Array.isArray(value) || value.length === 0) {
          return 'Car type is required';
        }
        return null;
      }
    },
    images: {
      custom: (value: unknown) => {
        if (!value || !Array.isArray(value) || value.length === 0) {
          return 'At least one image is required';
        }
        return null;
      }
    },
    description: {
      ...commonValidationRules.required('Description is required'),
      ...commonValidationRules.minLength(10, 'Description must be at least 10 characters'),
      ...commonValidationRules.maxLength(2000, 'Description must be no more than 2000 characters')
    }
  };

  const {
    data: formData,
    errors,
    isSubmitting,
    isValid,
    setField,
    setError,
    handleSubmit: handleFormSubmit,
    reset
  } = useFormValidation({
    initialData: car || defaultCar,
    validationRules,
    onSubmit: async (data) => {
      try {
        // Additional validation for discounted price
        if (data.discountedPrice && data.originalPrice && data.discountedPrice >= data.originalPrice) {
          setError('discountedPrice', 'Discounted price must be less than the original price');
          return;
        }

        // Process keywords from raw input
        const rawKeywords = data.keywords?.[0] || '';
        const processedKeywords = rawKeywords
          .split(',')
          .map(k => k.trim())
          .filter(k => k.length > 0);

        // Map frontend Car interface to server expected format
        const carData = {
          name: data.name?.trim() || '',
          brand: data.brand?.trim() || '',
          brandId: data.brandId,
          model: data.model?.trim() || data.name?.trim() || '',
          originalPrice: data.originalPrice || 0,
          discountedPrice: data.discountedPrice || 0,
          images: data.images || [],
          description: data.description || '',
          keywords: processedKeywords,
          features: data.features || [],
          available: data.available ?? true,
          featured: data.featured ?? false,
          seater: data.seater,
          carTypeIds: data.carTypeIds || [],
          tagIds: data.tagIds || [],
        };

        await onSave(carData);
        onOpenChange(false);
        toast({
          title: "Success",
          description: car ? "Car updated successfully" : "Car created successfully",
        });
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    }
  });
  
  useEffect(() => {
    // Reset form data and preview images when car prop changes
    if (open) {
      reset();
    setPreviewImages(car?.images || []);
    setCoverImageIndex(0); // Reset cover image to first image
      // setTagsInput(car?.tags ? car.tags.join(', ') : '');
      clearApiError();
    }
  }, [open, car, reset, clearApiError]);

  // --- Brand API integration ---
  const { data: brands, loading: brandsLoading, error: brandsError } = useBrands({ limit: 100 });
  const { data: categories, loading: categoriesLoading } = useCategories({ limit: 100 });
  
  // Handle both response structures: { data: [...] } and { categories: [...] }
  const categoriesArray: Category[] = useMemo(() => {
    if (categories && typeof categories === 'object') {
      if (Array.isArray((categories as { data?: unknown }).data)) {
        return ((categories as { data: unknown }).data as unknown as Category[]);
      }
      if (Array.isArray(((categories as unknown) as { categories?: unknown }).categories)) {
        return ((categories as unknown) as { categories: Category[] }).categories;
      }
    }
    return [];
  }, [categories]);
  const carTypeCategories: Category[] = categoriesArray.filter((cat) => cat.type === 'carType');
  const tagCategories: Category[] = categoriesArray.filter((cat) => cat.type === 'tag');
  

  useEffect(() => {
    // setBrands([]); // or mock data
  }, []);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      // Validate file types before upload
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const invalidFiles = Array.from(files).filter(file => !allowedTypes.includes(file.type));
      
      if (invalidFiles.length > 0) {
        const invalidFileNames = invalidFiles.map(file => file.name).join(', ');
        toast({
          title: `Invalid file type(s): ${invalidFileNames}`,
          description: `Allowed file types: JPEG, JPG, PNG, WebP`,
          variant: 'destructive',
        });
        setUploading(false);
        return;
      }

      // Validate file sizes (max 10MB per file)
      const maxSize = 10 * 1024 * 1024; // 10MB
      const oversizedFiles = Array.from(files).filter(file => file.size > maxSize);
      
      if (oversizedFiles.length > 0) {
        const oversizedFileNames = oversizedFiles.map(file => file.name).join(', ');
        toast({
          title: `File(s) too large: ${oversizedFileNames}`,
          description: `Maximum file size: 10MB`,
          variant: 'destructive',
        });
        setUploading(false);
        return;
      }

      // Create temporary preview URLs
      const newPreviewUrls = Array.from(files).map(file => URL.createObjectURL(file));
      setPreviewImages([...previewImages, ...newPreviewUrls]);

      // Upload images to backend with Authorization header
      const tempId = car?.id || 'temp-' + Date.now(); // Use existing car ID or generate temp ID
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const uploadedUrls = await Promise.all(
        Array.from(files).map(file => uploadImage(file, tempId, token || undefined))
      );

      // Update form data with new image URLs
      setField('images', [...(formData.images || []), ...uploadedUrls]);

      // Clean up temporary preview URLs
      newPreviewUrls.forEach(URL.revokeObjectURL);
    } catch (error) {
      console.error('Error uploading images:', error);
      const apiError = handleApiError(error);
      
      toast({
        title: apiError.message,
        variant: 'destructive',
      });
      
      // Remove any temporary preview URLs that were created
      const newPreviewUrls = Array.from(files).map(file => URL.createObjectURL(file));
      newPreviewUrls.forEach(URL.revokeObjectURL);
    } finally {
      setUploading(false);
      // Clear the file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setField('images', (formData.images || []).filter((_, i) => i !== index));
    // Adjust cover image index if the removed image was before it
    if (index < coverImageIndex) {
      setCoverImageIndex(prev => prev - 1);
    } else if (index === coverImageIndex) {
      setCoverImageIndex(0); // Reset to first image if cover was removed
    }
  };

  const setCoverImage = (index: number) => {
    // Move the selected image to the first position
    const newImages = [...previewImages];
    const [selectedImage] = newImages.splice(index, 1);
    newImages.unshift(selectedImage);
    setPreviewImages(newImages);
    
    // Update form data images
    const newFormImages = [...(formData.images || [])];
    const [selectedFormImage] = newFormImages.splice(index, 1);
    newFormImages.unshift(selectedFormImage);
    setField('images', newFormImages);
    
    // Set cover image index to 0 (first position)
    setCoverImageIndex(0);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...previewImages];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setPreviewImages(newImages);
    
    // Update form data images
    const newFormImages = [...(formData.images || [])];
    const [movedFormImage] = newFormImages.splice(fromIndex, 1);
    newFormImages.splice(toIndex, 0, movedFormImage);
    setField('images', newFormImages);
    
    // Adjust cover image index
    if (fromIndex === coverImageIndex) {
      setCoverImageIndex(toIndex);
    } else if (fromIndex < coverImageIndex && toIndex >= coverImageIndex) {
      setCoverImageIndex(prev => prev - 1);
    } else if (fromIndex > coverImageIndex && toIndex <= coverImageIndex) {
      setCoverImageIndex(prev => prev + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    await handleFormSubmit(e);
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExtension.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Enter car description... Use the toolbar above to format your text.',
      }),
    ],
    content: '',
    editable: !isSubmitting && !uploading,
    onUpdate: ({ editor }) => {
      setField('description', editor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && open) {
      if (car?.description) {
        // Set content when editing an existing car
        editor.commands.setContent(car.description);
      } else {
        // Clear content when creating a new car
        editor.commands.setContent('');
      }
    }
  }, [editor, open, car?.description]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(!isSubmitting && !uploading);
    }
  }, [editor, isSubmitting, uploading]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">{car ? 'Edit Car' : 'Add New Car'}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Fill in the car details below. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        {apiError && (
          <FormErrorDisplay 
            error={apiError} 
            onDismiss={clearApiError}
            className="mb-4"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-card-foreground">Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setField('name', e.target.value)}
                  className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
                  disabled={isSubmitting || uploading}
                  required
                />
                <FieldError error={errors.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand" className="text-card-foreground">Brand *</Label>
                <Select
                  value={typeof formData.brandId === 'string' ? formData.brandId : formData.brandId?.id || ''}
                  onValueChange={(value) => {
                    const selectedBrand = (brands?.data as unknown as Brand[])?.find((b: Brand) => b.id === value);
                    setField('brand', selectedBrand?.name || '');
                    setField('brandId', selectedBrand?.id || '');
                  }}
                  disabled={brandsLoading || isSubmitting || uploading}
                >
                  <SelectTrigger className={errors.brand ? 'border-destructive focus-visible:ring-destructive' : ''}>
                    <SelectValue placeholder={brandsLoading ? 'Loading brands...' : 'Select brand'} />
                  </SelectTrigger>
                  <SelectContent>
                    {brandsError && (
                      <div className="px-2 py-1 text-red-500 text-sm">Failed to load brands</div>
                    )}
                    {brands?.data && Array.isArray(brands.data) && brands.data.length > 0 ? (
                      (brands.data as unknown as Brand[]).map((brand: Brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))
                    ) : !brandsLoading && !brandsError ? (
                      <div className="px-2 py-1 text-muted-foreground text-sm">No brands found</div>
                    ) : null}
                  </SelectContent>
                </Select>
                <FieldError error={errors.brand} />
              </div>
              {/* <div className="space-y-2">
                <Label htmlFor="year" className="text-card-foreground">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year || ''}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 0 })}
                  required
                />
              </div> */}
              <div className="space-y-2">
                <Label htmlFor="model" className="text-card-foreground">Model *</Label>
                <Input
                  id="model"
                  value={formData.model || ''}
                  onChange={(e) => setField('model', e.target.value)}
                  className={errors.model ? 'border-destructive focus-visible:ring-destructive' : ''}
                  disabled={isSubmitting || uploading}
                  required
                />
                <FieldError error={errors.model} />
              </div>
              {/* <div className="space-y-2">
                <Label htmlFor="mileage" className="text-card-foreground">Mileage *</Label>
                <Input
                  id="mileage"
                  type="number"
                  value={formData.mileage || ''}
                  onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) || 0 })}
                  required
                />
              </div> */}
              {/* <div className="space-y-2">
                <Label htmlFor="engine" className="text-card-foreground">Engine</Label>
                <Input
                  id="engine"
                  value={formData.engine || ''}
                  onChange={(e) => setFormData({ ...formData, engine: e.target.value })}
                />
              </div> */}
              {/* <div className="space-y-2">
                <Label htmlFor="power" className="text-card-foreground">Power</Label>
                <Input
                  id="power"
                  value={formData.power || ''}
                  onChange={(e) => setFormData({ ...formData, power: e.target.value })}
                />
              </div> */}
              <div className="space-y-2">
                <Label htmlFor="seater" className="text-card-foreground">Seater</Label>
                <Input
                  id="seater"
                  type="number"
                  min={1}
                  value={formData.seater || ''}
                  onChange={(e) => setField('seater', parseInt(e.target.value) || undefined)}
                  disabled={isSubmitting || uploading}
                />
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Technical Specifications</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Car Types dropdown single-select */}
              <div className="space-y-2">
                <Label className="text-card-foreground">Car Type *</Label>
                <Select
                  value={formData.carTypeIds?.[0] ? getId(formData.carTypeIds[0]) : ''}
                  onValueChange={(value) => setField('carTypeIds', [value])}
                  disabled={categoriesLoading || isSubmitting || uploading}
                >
                  <SelectTrigger className={errors.carTypeIds ? 'border-destructive focus-visible:ring-destructive' : ''}>
                    <SelectValue placeholder={categoriesLoading ? 'Loading car types...' : 'Select car type'} />
                  </SelectTrigger>
                  <SelectContent>
                    {carTypeCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id || ''}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError error={errors.carTypeIds} />
              </div>

              {/* Transmission dropdown single-select */}
              {/* <div className="space-y-2">
                <Label className="text-card-foreground">Transmission</Label>
                <Select
                  value={formData.transmissionIds?.[0] || ''}
                  onValueChange={(value) => setFormData({ ...formData, transmissionIds: [value] })}
                  disabled={categoriesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={categoriesLoading ? 'Loading transmissions...' : 'Select transmission'} />
                  </SelectTrigger>
                  <SelectContent>
                    {transmissionCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id || ''}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div> */}

              {/* Fuel Types dropdown single-select */}
              {/* <div className="space-y-2">
                <Label className="text-card-foreground">Fuel Type</Label>
                <Select
                  value={formData.fuelTypeIds?.[0] || ''}
                  onValueChange={(value) => setFormData({ ...formData, fuelTypeIds: [value] })}
                  disabled={categoriesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={categoriesLoading ? 'Loading fuel types...' : 'Select fuel type'} />
                  </SelectTrigger>
                  <SelectContent>
                    {fuelTypeCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id || ''}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div> */}

              {/* Tags remains as checkbox-based multi-select */}
              <div className="space-y-2">
                <Label className="text-card-foreground">Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {tagCategories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={!!cat.id && (formData.tagIds || []).some(id => getId(id) === cat.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          if (!cat.id) return;
                          const currentTagIds = formData.tagIds || [];
                          const newTagIds = checked
                            ? [...currentTagIds.map(id => getId(id)).filter((id): id is string => !!id), cat.id as string]
                            : currentTagIds.map(id => getId(id)).filter((id): id is string => !!id && id !== cat.id);
                          setField('tagIds', newTagIds);
                        }}
                      />
                      {cat.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing and Type */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Pricing and Type</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="originalPrice" className="text-card-foreground">Original Price *</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  value={formData.originalPrice || ''}
                  onChange={(e) => setField('originalPrice', parseFloat(e.target.value) || 0)}
                  className={errors.originalPrice ? 'border-destructive focus-visible:ring-destructive' : ''}
                  disabled={isSubmitting || uploading}
                  required
                />
                <FieldError error={errors.originalPrice} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountedPrice" className="text-card-foreground">Discounted Price</Label>
                <Input
                  id="discountedPrice"
                  type="number"
                  value={formData.discountedPrice || ''}
                  onChange={(e) => setField('discountedPrice', parseFloat(e.target.value) || 0)}
                  className={errors.discountedPrice ? 'border-destructive focus-visible:ring-destructive' : ''}
                  disabled={isSubmitting || uploading}
                />
                <FieldError error={errors.discountedPrice} />
              </div>
            </div>
          </div>

          {/* Features and Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Features and Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isAvailable"
                  checked={formData.available ?? true}
                  onCheckedChange={(checked) => setField('available', checked)}
                  disabled={isSubmitting || uploading}
                />
                <Label htmlFor="isAvailable" className="text-card-foreground">Available for Rent</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isFeatured"
                  checked={formData.featured ?? false}
                  onCheckedChange={(checked) => setField('featured', checked)}
                  disabled={isSubmitting || uploading}
                />
                <Label htmlFor="isFeatured" className="text-card-foreground">Featured</Label>
              </div>
            </div>
            

          </div>

          {/* Images */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-card-foreground">Car Images *</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  Cover Image
                </span>
              </div>
            </div>
            
            {/* Upload Section */}
            <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 bg-muted/20">
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4" />
                      Add Images
                    </>
                  )}
                </Button>
                <div className="text-sm text-muted-foreground">
                  {previewImages.length === 0 ? (
                    <span>No images uploaded yet</span>
                  ) : (
                    <span>{previewImages.length} image{previewImages.length !== 1 ? 's' : ''} uploaded</span>
                  )}
                </div>
              </div>
              
              {/* File Type and Size Info */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </div>

            {/* Image Gallery */}
            {previewImages.length > 0 && (
              <div className="space-y-4">
                {/* Gallery Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      <span className="text-sm font-medium text-primary">Cover: Image {coverImageIndex + 1}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {previewImages.length} total
                    </span>
                  </div>
                </div>

                {/* Image Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {previewImages.map((url, index) => (
                    <div 
                      key={`${url}-${index}`} 
                      className={`relative group aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        index === coverImageIndex 
                          ? 'border-primary shadow-lg shadow-primary/20' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {/* Cover Badge */}
                      {index === coverImageIndex && (
                        <div className="absolute top-3 left-3 z-20 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                          <span className="flex items-center gap-1">
                            <span>⭐</span>
                            Cover
                          </span>
                        </div>
                      )}
                      
                      {/* Image */}
                      {url && url.trim() !== '' && (
                        <Image
                          src={url}
                          alt={`Car image ${index + 1}`}
                          fill
                          className="object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                      )}
                      
                      {/* Overlay Actions */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col justify-between p-4">
                        {/* Top Actions */}
                        <div className="flex items-center justify-between">
                          <div className="bg-black/50 text-white text-sm px-3 py-1.5 rounded-full font-medium">
                            #{index + 1}
                          </div>
                          <Button
                            type="button"
                            size="default"
                            variant="destructive"
                            onClick={() => removeImage(index)}
                            className="h-8 w-8 p-0 rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {/* Bottom Actions */}
                        <div className="flex flex-col gap-3">
                          {/* Set as Cover Button */}
                          {index !== coverImageIndex && (
                            <Button
                              type="button"
                              size="default"
                              variant="secondary"
                              onClick={() => setCoverImage(index)}
                              className="w-full text-sm bg-white/90 text-black hover:bg-white font-medium"
                            >
                              Set as Cover
                            </Button>
                          )}
                          
                          {/* Move Buttons */}
                          <div className="flex gap-2">
                            {index > 0 && (
                              <Button
                                type="button"
                                size="default"
                                variant="outline"
                                onClick={() => moveImage(index, index - 1)}
                                className="flex-1 h-8 text-sm bg-black/50 border-white/20 text-white hover:bg-black/70 font-medium"
                              >
                                ↑
                              </Button>
                            )}
                            {index < previewImages.length - 1 && (
                              <Button
                                type="button"
                                size="default"
                                variant="outline"
                                onClick={() => moveImage(index, index + 1)}
                                className="flex-1 h-8 text-sm bg-black/50 border-white/20 text-white hover:bg-black/70 font-medium"
                              >
                                ↓
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Help Text */}
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <h4 className="text-sm font-medium text-card-foreground">Image Management Tips:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0"></span>
                      <span><strong>Cover Image:</strong> The first image customers see</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0"></span>
                      <span><strong>Reorder:</strong> Use ↑↓ buttons to change order</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0"></span>
                      <span><strong>Quality:</strong> Upload high-resolution images</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <FieldError error={errors.images} />
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Description *</h3>
            <div className="space-y-2">
              {/* TipTap Editor Toolbar */}
              <div className="border border-input rounded-t-md p-2 bg-muted/50 flex flex-wrap gap-1">
                {/* Text Size Dropdown */}
                <Select
                  onValueChange={(value) => {
                    if (value === 'h1') {
                      editor?.chain().focus().toggleHeading({ level: 1 }).run();
                    } else if (value === 'h2') {
                      editor?.chain().focus().toggleHeading({ level: 2 }).run();
                    } else if (value === 'h3') {
                      editor?.chain().focus().toggleHeading({ level: 3 }).run();
                    } else if (value === 'p') {
                      editor?.chain().focus().setParagraph().run();
                    }
                  }}
                >
                  <SelectTrigger className="h-8 w-20 text-xs">
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="h1">H1</SelectItem>
                    <SelectItem value="h2">H2</SelectItem>
                    <SelectItem value="h3">H3</SelectItem>
                    <SelectItem value="p">Text</SelectItem>
                  </SelectContent>
                </Select>
                <div className="w-px h-6 bg-border mx-1" />
                <Button
                  type="button"
                  variant={editor?.isActive('bold') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  className="h-8 w-8 p-0"
                  title="Bold"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant={editor?.isActive('italic') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  className="h-8 w-8 p-0"
                  title="Italic"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant={editor?.isActive('underline') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleUnderline().run()}
                  className="h-8 w-8 p-0"
                  title="Underline"
                >
                  <Underline className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button
                  type="button"
                  variant={editor?.isActive('bulletList') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  className="h-8 w-8 p-0"
                  title="Bullet List"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant={editor?.isActive('orderedList') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                  className="h-8 w-8 p-0"
                  title="Numbered List"
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button
                  type="button"
                  variant={editor?.isActive('link') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    const url = prompt('Enter URL:');
                    if (url) {
                      editor?.chain().focus().setLink({ href: url }).run();
                    }
                  }}
                  className="h-8 w-8 p-0"
                  title="Insert Link"
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button
                  type="button"
                  variant={editor?.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                  className="h-8 w-8 p-0"
                  title="Align Left"
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant={editor?.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                  className="h-8 w-8 p-0"
                  title="Align Center"
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant={editor?.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                  className="h-8 w-8 p-0"
                  title="Align Right"
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </div>
              
              {/* TipTap Editor Content */}
              <div className={`border rounded-b-md bg-background ${
                errors.description ? 'border-destructive' : 'border-input'
              }`}>
                <EditorContent 
                  editor={editor} 
                  className="min-h-[128px] max-h-[300px] overflow-y-auto p-3 focus:outline-none"
                  style={{
                    '--tw-prose-body': 'inherit',
                    '--tw-prose-headings': 'inherit',
                    '--tw-prose-links': 'inherit',
                    '--tw-prose-bold': 'inherit',
                    '--tw-prose-counters': 'inherit',
                    '--tw-prose-bullets': 'inherit',
                    '--tw-prose-hr': 'inherit',
                    '--tw-prose-quotes': 'inherit',
                    '--tw-prose-quote-borders': 'inherit',
                    '--tw-prose-captions': 'inherit',
                    '--tw-prose-code': 'inherit',
                    '--tw-prose-pre-code': 'inherit',
                    '--tw-prose-pre-bg': 'inherit',
                    '--tw-prose-th-borders': 'inherit',
                    '--tw-prose-td-borders': 'inherit',
                  } as React.CSSProperties}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Use the toolbar above to format your text. The content will be saved as HTML.
              </p>
            </div>
            <FieldError error={errors.description} />
          </div>

          {/* Keywords */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Keywords</h3>
            <div className="space-y-2">
              <Textarea
                id="keywords"
                placeholder="Enter keywords separated by commas (e.g., luxury, sport, automatic, diesel)"
                value={formData.keywords?.join(', ') || ''}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  // Store the raw input as a single string for now
                  setField('keywords', [inputValue]);
                }}
                className="min-h-[80px]"
              />
              {/* Show current keywords for debugging */}
              {formData.keywords && formData.keywords.length > 0 && formData.keywords[0] && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Current input:</span> {formData.keywords[0]}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Add relevant keywords to help customers find this car. Separate multiple keywords with commas.
              </p>
            </div>
          </div>


          <DialogFooter>
            <Button 
              type="submit" 
              disabled={!isValid || isSubmitting || uploading}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Save Car'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
