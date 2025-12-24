'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Category } from '@/types/category';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Upload, X, Loader2 } from 'lucide-react';
import { uploadImage } from '@/lib/cloudinary';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { FormErrorDisplay, FieldError } from '@/components/ui/form-error';
import { useFormValidation } from '@/hooks/useFormValidation';
import { commonValidationRules } from '@/components/ui/form-validation';
import { useApiError } from '@/hooks/useApiError';
import { useToast } from '@/components/hooks/use-toast';

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
  onSave: (category: Partial<Category>) => Promise<void>;
}

export function CategoryDialog({ open, onOpenChange, category, onSave }: CategoryDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { error: apiError, handleApiError, clearError: clearApiError } = useApiError();

  const validationRules = {
    name: {
      ...commonValidationRules.required('Category name is required'),
      ...commonValidationRules.minLength(2, 'Category name must be at least 2 characters'),
      ...commonValidationRules.maxLength(50, 'Category name must be no more than 50 characters')
    },
    type: {
      ...commonValidationRules.required('Category type is required')
    },
    slug: {
      ...commonValidationRules.required('Slug is required'),
      ...commonValidationRules.slug('Slug can only contain lowercase letters, numbers, and hyphens'),
      ...commonValidationRules.minLength(2, 'Slug must be at least 2 characters'),
      ...commonValidationRules.maxLength(50, 'Slug must be no more than 50 characters')
    },
    description: {
      ...commonValidationRules.maxLength(500, 'Description must be no more than 500 characters')
    }
  };

  const {
    data: formData,
    errors,
    isSubmitting,
    isValid,
    setField,
    setError,
    clearError,
    handleSubmit: handleFormSubmit,
    reset
  } = useFormValidation({
    initialData: category || {
      name: '',
      type: 'carType' as const,
      slug: '',
      featured: false,
      image: '',
      description: '',
    },
    validationRules,
    onSubmit: async (data) => {
      try {
        await onSave(data as Category);
        onOpenChange(false);
        toast({
          title: "Success",
          description: category ? "Category updated successfully" : "Category created successfully",
        });
      } catch (error) {
        handleApiError(error);
        throw error; // Re-throw to prevent form from thinking it succeeded
      }
    }
  });

  useEffect(() => {
    if (open) {
      reset();
      setPreviewUrl(category?.image === null ? undefined : category?.image);
      clearApiError();
    }
  }, [open, category, reset, clearApiError]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('image', 'Invalid file type. Only JPEG, JPG, PNG, and WebP are allowed.');
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('image', 'File size must be less than 5MB.');
      return;
    }

    setIsUploading(true);
    clearError('image');
    clearApiError();

    try {
      // Create temporary preview
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);

      // Upload to backend with Authorization header
      const categoryId = category?.id || 'temp-' + Date.now();
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') || undefined : undefined;
      const imageUrl = await uploadImage(file, `categories/${categoryId}/image`, token);

      // Update form data with the new image URL
      setField('image', imageUrl);

      // Clean up preview URL
      URL.revokeObjectURL(newPreviewUrl);

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error: unknown) {
      console.error('Error uploading image:', error);
      const apiError = handleApiError(error);
      setError('image', apiError.message);
      
      // Remove preview if upload failed
      setPreviewUrl(category?.image === null ? undefined : category?.image);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(undefined);
    setField('image', '');
    clearError('image');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    await handleFormSubmit(e);
  };

  const handleInputChange = (field: keyof Category, value: string | boolean) => {
    setField(field, value);

      // Always auto-generate slug from name when name changes, unless slug was manually edited
      if (field === 'name' && typeof value === 'string') {
        const autoSlug = value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        
        // Only update slug if it's empty or was auto-generated from previous name
      if (!formData.slug || formData.slug === formData.name?.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')) {
        setField('slug', autoSlug);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" aria-describedby="category-form-description">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">{category ? 'Edit Category' : 'Add Category'}</DialogTitle>
          <p id="category-form-description" className="text-sm text-muted-foreground">
            {category ? 'Edit the category details below.' : 'Fill in the details to create a new category.'}
          </p>
        </DialogHeader>

        {apiError && (
          <FormErrorDisplay 
            error={apiError} 
            onDismiss={clearApiError}
            className="mb-4"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-card-foreground">Name *</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter category name"
              className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
              disabled={isSubmitting || isUploading}
            />
            <FieldError error={errors.name} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-card-foreground">Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleInputChange('type', value)}
              disabled={isSubmitting || isUploading}
            >
              <SelectTrigger className={errors.type ? 'border-destructive focus-visible:ring-destructive' : ''}>
                <SelectValue placeholder="Select category type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="carType">Car Type</SelectItem>
                <SelectItem value="fuelType">Fuel Type</SelectItem>
                <SelectItem value="transmission">Transmission</SelectItem>
                <SelectItem value="tag">Tag</SelectItem>
              </SelectContent>
            </Select>
            <FieldError error={errors.type} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="text-card-foreground">Slug *</Label>
            <Input
              id="slug"
              value={formData.slug || ''}
              onChange={(e) => handleInputChange('slug', e.target.value)}
              placeholder="category-slug"
              className={errors.slug ? 'border-destructive focus-visible:ring-destructive' : ''}
              disabled={isSubmitting || isUploading}
            />
            <FieldError error={errors.slug} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-card-foreground">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter category description (optional)"
              className={`min-h-[100px] ${errors.description ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              disabled={isSubmitting || isUploading}
            />
            <FieldError error={errors.description} />
          </div>

          <div className="space-y-2">
            <Label className="text-card-foreground">Image</Label>
            <div className="mt-2 flex items-center gap-4">
              {previewUrl && previewUrl.trim() !== '' ? (
                <div className="relative w-32 h-32">
                  <Image
                    src={previewUrl}
                    alt="Category preview"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                    disabled={isSubmitting || isUploading}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-border rounded-md">
                  <label htmlFor="image-upload" className="cursor-pointer">
                    {isUploading ? (
                      <Loader2 className="mx-auto h-12 w-12 text-muted-foreground animate-spin" />
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                        <span className="mt-2 block text-sm text-muted-foreground">Upload Image</span>
                      </>
                    )}
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageSelect}
                    className="sr-only"
                    disabled={isSubmitting || isUploading}
                  />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Supported formats: JPEG, JPG, PNG, WebP (max 5MB)
            </p>
            <FieldError error={errors.image} />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={formData.featured || false}
              onCheckedChange={(checked) => handleInputChange('featured', checked)}
              disabled={isSubmitting || isUploading}
            />
            <Label htmlFor="featured" className="text-card-foreground">Featured</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || isUploading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!isValid || isSubmitting || isUploading}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
