import { Car, CreateCarData, UpdateCarData } from '@/types/car';
import { Car as CarModel } from '@/lib/models';
import { dbConnect } from '@/lib/mongodb';
import type { ICar } from '@/lib/models/carSchema';
import { Model } from 'mongoose';

// Type for MongoDB document with _id
interface MongoDocument {
  _id?: { toString: () => string } | string;
  __v?: number;
  [key: string]: unknown;
}

// Type for processed car data that might have dailyPrice
interface ProcessedCarData extends CreateCarData {
  dailyPrice?: number;
}

// Helper function to transform MongoDB document to Car type
function transformMongoDocToCar(doc: MongoDocument): Car {
  const car = { ...doc } as Car;
  if (doc._id) {
    car.id = typeof doc._id === 'object' ? doc._id.toString() : doc._id;
  }
  if ('_id' in car) delete (car as MongoDocument)._id;
  if ('__v' in car) delete (car as MongoDocument).__v;
  return car;
}

export interface CarFilters {
  brand?: string;
  carTypeId?: string;
  transmissionId?: string;
  fuelTypeId?: string;
  minPrice?: number;
  maxPrice?: number;
  available?: boolean;
  featured?: boolean;
  search?: string;
  brandId?: string;
}

export interface CarSearchOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class CarService {
  /**
   * Create a new car
   */
  static async createCar(carData: CreateCarData): Promise<Car> {
    try {
      await dbConnect();
      
      // Handle migration from dailyPrice to originalPrice
      const processedData: ProcessedCarData = { ...carData };
      
      // If dailyPrice exists in the data, map it to originalPrice
      if ('dailyPrice' in processedData && processedData.dailyPrice && !processedData.originalPrice) {
        processedData.originalPrice = processedData.dailyPrice;
        delete processedData.dailyPrice;
      }
      
      // Ensure originalPrice exists
      if (!processedData.originalPrice) {
        throw new Error('originalPrice is required');
      }
      
      // Validate price values
      if (processedData.originalPrice <= 0) {
        throw new Error('Original price must be greater than 0');
      }
      
      if (processedData.discountedPrice && processedData.discountedPrice < 0) {
        throw new Error('Discounted price cannot be negative');
      }
      
      if (processedData.discountedPrice && processedData.discountedPrice >= processedData.originalPrice) {
        throw new Error('Discounted price must be less than original price');
      }
      
      // Validate images
      if (!processedData.images || processedData.images.length === 0) {
        throw new Error('At least one image is required');
      }
      
      // Validate car types
      if (!processedData.carTypeIds || processedData.carTypeIds.length === 0) {
        throw new Error('At least one car type must be selected');
      }
      
      const car = new CarModel(processedData);
      const savedCar = await car.save();
      const carObj = savedCar.toJSON() as MongoDocument & Car;
      if (carObj._id) {
        carObj.id = typeof carObj._id === 'object' ? carObj._id.toString() : carObj._id;
      }
      if ('_id' in carObj) delete carObj._id;
      if ('__v' in carObj) delete carObj.__v;
      return carObj as Car;
    } catch (error) {
      console.error('Error creating car:', error);
      
      // Handle specific MongoDB errors
      if (error instanceof Error) {
        if (error.message.includes('duplicate key error')) {
          throw new Error('A car with this name already exists');
        }
        if (error.message.includes('validation failed')) {
          throw new Error('Car data validation failed. Please check all required fields');
        }
        if (error.message.includes('Cast to ObjectId failed')) {
          throw new Error('Invalid ID format provided');
        }
        // Re-throw specific validation errors
        if (error.message.includes('is required') || 
            error.message.includes('must be') || 
            error.message.includes('cannot be')) {
          throw error;
        }
      }
      
      throw new Error('Failed to create car. Please check your data and try again');
    }
  }

  /**
   * Get a car by ID
   */
  static async getCarById(id: string): Promise<Car | null> {
    try {
      await dbConnect();
      const car = await CarModel.findById(id);
      if (!car) return null;
      const carObj = car.toJSON() as MongoDocument;
      return transformMongoDocToCar(carObj);
    } catch (error) {
      console.error('Error getting car by ID:', error);
      throw new Error('Failed to get car');
    }
  }

  /**
   * Get all cars with optional filtering and pagination
   */
  static async getAllCars(
    filters: CarFilters = {},
    options: CarSearchOptions = {}
  ): Promise<{ cars: Car[]; total: number; page: number; totalPages: number }> {
    try {
      await dbConnect();
      
      const { page = 1, limit = 12, sortBy = 'createdAt', sortOrder = 'desc' } = options;
      const skip = (page - 1) * limit;

      // Build query
      const query: Record<string, any> = {};

      if (filters.brand) {
        query.brand = { $regex: filters.brand, $options: 'i' };
      }

      if (filters.carTypeId) {
        query.carTypeIds = filters.carTypeId;
      }

      if (filters.transmissionId) {
        query.transmissionIds = filters.transmissionId;
      }

      if (filters.fuelTypeId) {
        query.fuelTypeIds = filters.fuelTypeId;
      }

      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        // Use discountedPrice if available, otherwise use originalPrice
        query.$or = [
          { discountedPrice: { $exists: true, $ne: null } },
          { originalPrice: {} }
        ];
        
        if (filters.minPrice !== undefined) {
          query.$or[0].discountedPrice = { $gte: filters.minPrice };
          query.$or[1].originalPrice = { $gte: filters.minPrice };
        }
        if (filters.maxPrice !== undefined) {
          if (filters.minPrice !== undefined) {
            query.$or[0].discountedPrice = { ...query.$or[0].discountedPrice, $lte: filters.maxPrice };
            query.$or[1].originalPrice = { ...query.$or[1].originalPrice, $lte: filters.maxPrice };
          } else {
            query.$or[0].discountedPrice = { $lte: filters.maxPrice };
            query.$or[1].originalPrice = { $lte: filters.maxPrice };
          }
        }
      }

      if (filters.available !== undefined) {
        query.available = filters.available;
      }

      if (filters.featured !== undefined) {
        query.featured = filters.featured;
      }

      if (filters.search) {
        query.$text = { $search: filters.search };
      }

      if (filters.brandId) {
        query.brandId = filters.brandId;
      }

      // Build sort object
      const sort: { [key: string]: 1 | -1 } = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query
      const [cars, total] = await Promise.all([
        CarModel.find(query)
          .populate('brandId')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        CarModel.countDocuments(query)
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        cars: cars.map(car => transformMongoDocToCar(car as MongoDocument)),
        total,
        page,
        totalPages
      };
    } catch (error) {
      console.error('Error getting all cars:', error);
      throw new Error('Failed to get cars');
    }
  }

  /**
   * Update a car
   */
  static async updateCar(id: string, updateData: UpdateCarData): Promise<Car | null> {
    try {
      await dbConnect();
      
      // Validate ID format
      if (!id || id.trim() === '') {
        throw new Error('Car ID is required');
      }
      
      // Handle migration from dailyPrice to originalPrice
      const processedData: ProcessedCarData = { ...updateData };
      
      // If dailyPrice exists in the data, map it to originalPrice
      if ('dailyPrice' in processedData && processedData.dailyPrice && !processedData.originalPrice) {
        processedData.originalPrice = processedData.dailyPrice;
        delete processedData.dailyPrice;
      }
      
      // Validate price values if provided
      if (processedData.originalPrice !== undefined) {
        if (processedData.originalPrice <= 0) {
          throw new Error('Original price must be greater than 0');
        }
      }
      
      if (processedData.discountedPrice !== undefined) {
        if (processedData.discountedPrice < 0) {
          throw new Error('Discounted price cannot be negative');
        }
        
        if (processedData.originalPrice && processedData.discountedPrice >= processedData.originalPrice) {
          throw new Error('Discounted price must be less than original price');
        }
      }
      
      // Validate images if provided
      if (processedData.images !== undefined && (!Array.isArray(processedData.images) || processedData.images.length === 0)) {
        throw new Error('At least one image is required');
      }
      
      // Validate car types if provided
      if (processedData.carTypeIds !== undefined && (!Array.isArray(processedData.carTypeIds) || processedData.carTypeIds.length === 0)) {
        throw new Error('At least one car type must be selected');
      }
      
      const car = await CarModel.findByIdAndUpdate(
        id,
        { ...processedData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      if (!car) return null;
      const carObj = car.toJSON() as MongoDocument;
      return transformMongoDocToCar(carObj);
    } catch (error) {
      console.error('Error updating car:', error);
      
      // Handle specific MongoDB errors
      if (error instanceof Error) {
        if (error.message.includes('duplicate key error')) {
          throw new Error('A car with this name already exists');
        }
        if (error.message.includes('validation failed')) {
          throw new Error('Car data validation failed. Please check all required fields');
        }
        if (error.message.includes('Cast to ObjectId failed')) {
          throw new Error('Invalid car ID format');
        }
        // Re-throw specific validation errors
        if (error.message.includes('is required') || 
            error.message.includes('must be') || 
            error.message.includes('cannot be')) {
          throw error;
        }
      }
      
      throw new Error('Failed to update car. Please check your data and try again');
    }
  }

  /**
   * Delete a car
   */
  static async deleteCar(id: string): Promise<boolean> {
    try {
      await dbConnect();
      const result = await CarModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting car:', error);
      throw new Error('Failed to delete car');
    }
  }

  /**
   * Get featured cars
   */
  static async getFeaturedCars(limit: number = 6): Promise<Car[]> {
    try {
      await dbConnect();
      const cars = await CarModel.find({ featured: true, available: true })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return cars.map(car => ({
        ...car,
        id: car._id?.toString(),
        _id: undefined,
        __v: undefined,
        transmission: Array.isArray(car.transmissionIds) && car.transmissionIds.length > 0 ? String(car.transmissionIds[0]) : '',
        fuel: Array.isArray(car.fuelTypeIds) && car.fuelTypeIds.length > 0 ? String(car.fuelTypeIds[0]) : '',
      }));
    } catch (error) {
      console.error('Error getting featured cars:', error);
      throw new Error('Failed to get featured cars');
    }
  }

  /**
   * Get cars by brand
   */
  static async getCarsByBrand(brand: string, limit: number = 12): Promise<Car[]> {
    try {
      await dbConnect();
      const cars = await CarModel.find({ 
        brand: { $regex: brand, $options: 'i' },
        available: true 
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return cars.map(car => ({
        ...car,
        id: car._id?.toString(),
        _id: undefined,
        __v: undefined,
        transmission: Array.isArray(car.transmissionIds) && car.transmissionIds.length > 0 ? String(car.transmissionIds[0]) : '',
        fuel: Array.isArray(car.fuelTypeIds) && car.fuelTypeIds.length > 0 ? String(car.fuelTypeIds[0]) : '',
      }));
    } catch (error) {
      console.error('Error getting cars by brand:', error);
      throw new Error('Failed to get cars by brand');
    }
  }

  /**
   * Search cars
   */
  static async searchCars(query: string, limit: number = 12): Promise<Car[]> {
    try {
      await dbConnect();
      const cars = await CarModel.find({
        $text: { $search: query },
        available: true
      })
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .lean();

      return cars.map(car => ({
        ...car,
        id: car._id?.toString(),
        _id: undefined,
        __v: undefined,
        transmission: Array.isArray(car.transmissionIds) && car.transmissionIds.length > 0 ? String(car.transmissionIds[0]) : '',
        fuel: Array.isArray(car.fuelTypeIds) && car.fuelTypeIds.length > 0 ? String(car.fuelTypeIds[0]) : '',
      }));
    } catch (error) {
      console.error('Error searching cars:', error);
      throw new Error('Failed to search cars');
    }
  }

  /**
   * Get car statistics
   */
  static async getCarStats(): Promise<{
    total: number;
    available: number;
    featured: number;
    brands: string[];
    categories: string[];
  }> {
    try {
      await dbConnect();
      
      const [total, available, featured, brands] = await Promise.all([
        CarModel.countDocuments(),
        CarModel.countDocuments({ available: true }),
        CarModel.countDocuments({ featured: true }),
        CarModel.distinct('brand'),
      ]);

      return {
        total,
        available,
        featured,
        brands: brands.filter(Boolean),
        categories: [], // categories are now in carTypeIds, not a flat field
      };
    } catch (error) {
      console.error('Error getting car stats:', error);
      throw new Error('Failed to get car statistics');
    }
  }
} 