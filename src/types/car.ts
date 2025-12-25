
import { Brand } from './brand';
import { Category } from './category';

// Type for populated Brand (when brandId is populated)
export type PopulatedBrand = Pick<Brand, 'id' | 'name' | 'logo' | 'slug'>;

// Type for populated Category (when carTypeIds, etc. are populated)
export type PopulatedCategory = Pick<Category, 'id' | 'name' | 'type' | 'slug'>;

export interface Car {
  id: string;
  brand: string;
  brandId?: string | PopulatedBrand;
  model: string;
  name: string;
  year: number;
  transmission: string;
  fuel: string;
  mileage: number;
  originalPrice: number;
  discountedPrice?: number;
  images: string[];
  description?: string;
  keywords?: string[];
  features?: string[];
  category?: string;
  categoryId?: string;
  available?: boolean;
  featured?: boolean;
  engine?: string;
  power?: string;
  tags?: string[];
  seater?: number;
  carTypeIds?: string[] | PopulatedCategory[];
  transmissionIds?: string[] | PopulatedCategory[];
  fuelTypeIds?: string[] | PopulatedCategory[];
  tagIds?: string[] | PopulatedCategory[];
  fuelType?: string;
  type?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Type for creating a new car (without id and timestamps)
export interface CreateCarData extends Omit<Car, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
  brandId?: string;
  engine?: string;
  power?: string;
  tags?: string[];
  seater?: number;
  carTypeIds?: string[];
  transmissionIds?: string[];
  fuelTypeIds?: string[];
  tagIds?: string[];
}

// Type for updating a car
export interface UpdateCarData extends Partial<Omit<Car, 'id' | 'createdAt' | 'updatedAt'>> {
  brandId?: string;
  engine?: string;
  power?: string;
  tags?: string[];
  seater?: number;
  carTypeIds?: string[];
  transmissionIds?: string[];
  fuelTypeIds?: string[];
  tagIds?: string[];
}
