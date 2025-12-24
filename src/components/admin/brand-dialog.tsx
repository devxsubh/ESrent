import { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Brand } from '@/types/brand';
import { Switch } from '@/components/ui/switch';
import { uploadImage } from '@/lib/cloudinary';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { FormErrorDisplay, FieldError } from '@/components/ui/form-error';
import { useFormValidation } from '@/hooks/useFormValidation';
import { commonValidationRules } from '@/components/ui/form-validation';
import { useApiError } from '@/hooks/useApiError';
import { useToast } from '@/components/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';

interface BrandDialogProps {
  brand?: Brand;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (brand: Partial<Brand>) => Promise<void>;
}

const defaultBrand: Partial<Brand> = {
  name: '',
  slug: '',
  logo: '',
  featured: false,
};

export function BrandDialog({ brand, open, onOpenChange, onSave }: BrandDialogProps) {
  const [uploading, setUploading] = useState(false);
  const [previewLogo, setPreviewLogo] = useState<string>(brand?.logo || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { error: apiError, handleApiError, clearError: clearApiError } = useApiError();

  const validationRules = {
    name: {
      ...commonValidationRules.required('Brand name is required'),
      ...commonValidationRules.minLength(2, 'Brand name must be at least 2 characters'),
      ...commonValidationRules.maxLength(50, 'Brand name must be no more than 50 characters')
    },
    slug: {
      ...commonValidationRules.required('Slug is required'),
      ...commonValidationRules.slug('Slug can only contain lowercase letters, numbers, and hyphens'),
      ...commonValidationRules.minLength(2, 'Slug must be at least 2 characters'),
      ...commonValidationRules.maxLength(50, 'Slug must be no more than 50 characters')
    },
    logo: {
      ...commonValidationRules.required('Brand logo is required')
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
    initialData: brand || defaultBrand,
    validationRules,
    onSubmit: async (data) => {
      try {
        await onSave(data);
        onOpenChange(false);
        toast({
          title: "Success",
          description: brand ? "Brand updated successfully" : "Brand created successfully",
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
    setPreviewLogo(brand?.logo || '');
      clearApiError();
    }
  }, [open, brand, reset, clearApiError]);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('logo', 'Invalid file type. Only JPEG, JPG, PNG, and WebP are allowed.');
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('logo', 'File size must be less than 5MB.');
      return;
    }

    setUploading(true);
    clearError('logo');
    clearApiError();

    try {
      // Create temporary preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewLogo(previewUrl);

      // Upload logo to backend with Authorization header
      const tempId = brand?.id || 'temp-' + Date.now();
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') ?? undefined : undefined;
      const uploadedUrl = await uploadImage(file, `brands/${tempId}/logo`, token);

      // Update form data with new logo URL
      setField('logo', uploadedUrl);

      // Clean up temporary preview URL
      URL.revokeObjectURL(previewUrl);

      toast({
        title: "Success",
        description: "Logo uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      const apiError = handleApiError(error);
      setError('logo', apiError.message);
      
      // Remove preview if upload failed
      setPreviewLogo(brand?.logo || '');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    await handleFormSubmit(e);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (value: string) => {
    setField('name', value);
    // Auto-generate slug if it's empty or was auto-generated
    if (!formData.slug || formData.slug === generateSlug(formData.name || '')) {
      setField('slug', generateSlug(value));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">{brand ? 'Edit Brand' : 'Add New Brand'}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Fill in the brand details below. All fields marked with * are required.
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
            <div className="space-y-2">
              <Label htmlFor="name" className="text-card-foreground">Name *</Label>
                              <Input
                  id="name"
                  value={formData.name || ''}
                onChange={(e) => handleNameChange(e.target.value)}
                className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
                disabled={isSubmitting || uploading}
                  required
                />
              <FieldError error={errors.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-card-foreground">Slug *</Label>
                              <Input
                  id="slug"
                  value={formData.slug || ''}
                onChange={(e) => setField('slug', e.target.value)}
                className={errors.slug ? 'border-destructive focus-visible:ring-destructive' : ''}
                disabled={isSubmitting || uploading}
                  required
                />
              <FieldError error={errors.slug} />
            </div>
            <div className="flex items-center space-x-2">
                              <Switch
                  id="featured"
                  checked={formData.featured ?? false}
                onCheckedChange={(checked) => setField('featured', checked)}
                disabled={isSubmitting || uploading}
                />
              <Label htmlFor="featured" className="text-card-foreground">Featured Brand</Label>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Brand Logo *</h3>
            <div className="flex items-center gap-4">
              {previewLogo && typeof previewLogo === 'string' && previewLogo.trim() !== '' && previewLogo !== 'null' && previewLogo !== 'undefined' ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                  <Image
                    src={previewLogo}
                    alt="Brand logo preview"
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 border border-border rounded-lg flex items-center justify-center bg-muted">
                  <span className="text-muted-foreground text-sm">No logo</span>
                </div>
              )}
              <div className="space-y-2">
                <Input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  disabled={isSubmitting || uploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || isSubmitting}
                  className="flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload Logo'
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Supported formats: JPEG, JPG, PNG, WebP (max 5MB)
                </p>
              </div>
            </div>
            <FieldError error={errors.logo} />
          </div>
        </form>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            type="button" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting || uploading}
          >
            Cancel
          </Button>
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
            ) : (
              'Save Brand'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
