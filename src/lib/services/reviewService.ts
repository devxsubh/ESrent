import { Review, IReview } from '../models/reviewSchema';
import { dbConnect } from '../mongodb';
import mongoose from 'mongoose';

interface ReviewFilter {
  carId: string;
  isApproved?: boolean;
}

interface PopulatedCar {
  _id: string | mongoose.Types.ObjectId | { toString: () => string };
  name: string;
  brand: string;
  model: string;
}

export class ReviewService {
  // Get all reviews for a car (approved only for public, all for admin)
  static async getReviewsByCarId(carId: string, includeUnapproved: boolean = false) {
    await dbConnect();
    
    const filter: ReviewFilter = { carId };
    if (!includeUnapproved) {
      filter.isApproved = true;
    }
    
    const reviews = await Review.find(filter)
      .populate('carId', 'name brand model')
      .sort({ isFeatured: -1, createdAt: -1 })
      .lean();
    
    // Transform the data to match expected format
    return reviews.map(review => {
      const carId = review.carId;
      let populatedCar: PopulatedCar | null = null;
      let carIdValue: string | null = null;
      
      if (carId && typeof carId === 'object' && 'name' in carId && '_id' in carId) {
        // It's a populated car object
        populatedCar = carId as unknown as PopulatedCar;
        carIdValue = typeof populatedCar._id === 'object' && 'toString' in populatedCar._id
          ? populatedCar._id.toString() 
          : String(populatedCar._id);
      } else if (carId) {
        // It's just an ID (string or ObjectId)
        carIdValue = typeof carId === 'string' ? carId : String(carId);
      }
      
      return {
        ...review,
        car: populatedCar || null,
        carId: carIdValue
      };
    });
  }

  // Get featured reviews for a car
  static async getFeaturedReviewsByCarId(carId: string) {
    await dbConnect();
    
    return await Review.find({ 
      carId, 
      isApproved: true, 
      isFeatured: true 
    })
      .sort({ createdAt: -1 })
      .lean();
  }

  // Get all reviews (admin only)
  static async getAllReviews() {
    try {
      await dbConnect();
      
      const reviews = await Review.find({})
        .populate('carId', 'name brand model')
        .sort({ createdAt: -1 })
        .lean();
      
      // Transform the data to match expected format
      const transformedReviews = reviews.map(review => {
        try {
          const carId = review.carId;
          let populatedCar: PopulatedCar | null = null;
          let carIdValue: string | null = null;
          
          if (carId && typeof carId === 'object' && 'name' in carId) {
            // It's a populated car object
            populatedCar = carId as unknown as PopulatedCar;
            carIdValue = typeof populatedCar._id === 'object' 
              ? populatedCar._id.toString() 
              : String(populatedCar._id);
          } else if (carId) {
            // It's just an ID (string or ObjectId)
            carIdValue = typeof carId === 'string' ? carId : carId.toString();
          }
          
          return {
            ...review,
            car: populatedCar || null,
            carId: carIdValue
          };
        } catch (transformError) {
          console.error('Error transforming review:', transformError, review);
          return review;
        }
      });
      
      return transformedReviews;
    } catch (error) {
      console.error('Error in getAllReviews:', error);
      throw error;
    }
  }

  // Get pending reviews (admin only)
  static async getPendingReviews() {
    await dbConnect();
    
    const reviews = await Review.find({ isApproved: false })
      .populate('carId', 'name brand model')
      .sort({ createdAt: -1 })
      .lean();
    
    // Transform the data to match expected format
    return reviews.map(review => {
      const carId = review.carId;
      let populatedCar: PopulatedCar | null = null;
      let carIdValue: string | null = null;
      
      if (carId && typeof carId === 'object' && 'name' in carId) {
        // It's a populated car object
        populatedCar = carId as unknown as PopulatedCar;
        carIdValue = typeof populatedCar._id === 'object' 
          ? populatedCar._id.toString() 
          : String(populatedCar._id);
      } else if (carId) {
        // It's just an ID (string or ObjectId)
        carIdValue = typeof carId === 'string' ? carId : carId.toString();
      }
      
      return {
        ...review,
        car: populatedCar || null,
        carId: carIdValue
      };
    });
  }

  // Create a new review
  static async createReview(reviewData: Partial<IReview>) {
    await dbConnect();
    
    const review = new Review({
      ...reviewData,
      isApproved: false,
      isFeatured: false,
      isAdminCreated: false
    });
    
    return await review.save();
  }

  // Create a review as admin
  static async createAdminReview(reviewData: Partial<IReview>) {
    await dbConnect();
    
    const review = new Review({
      ...reviewData,
      isApproved: true,
      isFeatured: false,
      isAdminCreated: true
    });
    
    return await review.save();
  }

  // Update a review
  static async updateReview(reviewId: string, updateData: Partial<IReview>) {
    await dbConnect();
    
    return await Review.findByIdAndUpdate(
      reviewId,
      updateData,
      { new: true }
    );
  }

  // Approve a review
  static async approveReview(reviewId: string) {
    await dbConnect();
    
    return await Review.findByIdAndUpdate(
      reviewId,
      { isApproved: true },
      { new: true }
    );
  }

  // Reject a review (delete it)
  static async rejectReview(reviewId: string) {
    await dbConnect();
    
    return await Review.findByIdAndDelete(reviewId);
  }

  // Toggle featured status
  static async toggleFeatured(reviewId: string) {
    await dbConnect();
    
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }
    
    review.isFeatured = !review.isFeatured;
    return await review.save();
  }

  // Delete a review
  static async deleteReview(reviewId: string) {
    await dbConnect();
    
    return await Review.findByIdAndDelete(reviewId);
  }

  // Get featured and approved reviews for testimonials
  static async getFeaturedApprovedReviews() {
    await dbConnect();
    
    const reviews = await Review.find({ 
      isApproved: true,
      isFeatured: true 
    })
    .populate('carId', 'name brand model')
    .sort({ createdAt: -1 })
    .limit(9)
    .lean();
    
    // Transform the data to match expected format
    const transformedReviews = reviews.map(review => {
      try {
        const carId = review.carId;
        let populatedCar: PopulatedCar | null = null;
        let carIdValue: string | null = null;
        
        if (carId && typeof carId === 'object' && 'name' in carId) {
          // It's a populated car object
          populatedCar = carId as unknown as PopulatedCar;
          carIdValue = typeof populatedCar._id === 'object' 
            ? populatedCar._id.toString() 
            : String(populatedCar._id);
        } else if (carId) {
          // It's just an ID (string or ObjectId)
          carIdValue = typeof carId === 'string' ? carId : carId.toString();
        }
        
        return {
          ...review,
          car: populatedCar || null,
          carId: carIdValue
        };
      } catch (transformError) {
        console.error('Error transforming review:', transformError, review);
        return review;
      }
    });
    return transformedReviews;
  }

  // Get review statistics for a car
  static async getReviewStats(carId: string) {
    await dbConnect();
    
    const reviews = await Review.find({ 
      carId, 
      isApproved: true 
    }).lean();
    
    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    const ratingDistribution = reviews.reduce((acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
      ratingDistribution
    };
  }
}
