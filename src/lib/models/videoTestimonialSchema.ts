import mongoose, { Schema, Document } from 'mongoose';

export interface IVideoTestimonial extends Document {
  title: string;
  comment: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const videoTestimonialSchema = new Schema<IVideoTestimonial>({
  title: {
    type: String,
    required: [true, 'Testimonial title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  comment: {
    type: String,
    required: [true, 'Testimonial comment is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required'],
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Video URL must be a valid URL'
    }
  },
  thumbnailUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Optional field
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Thumbnail URL must be a valid URL'
    }
  },
  duration: {
    type: Number,
    min: [0, 'Duration cannot be negative']
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
videoTestimonialSchema.index({ isFeatured: 1 });
videoTestimonialSchema.index({ createdAt: -1 });

// Virtual for formatted duration
videoTestimonialSchema.virtual('formattedDuration').get(function() {
  if (!this.duration) return 'N/A';
  const mins = Math.floor(this.duration / 60);
  const secs = this.duration % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
});

// Virtual for status
videoTestimonialSchema.virtual('status').get(function() {
  return this.isFeatured ? 'featured' : 'normal';
});

// Pre-save middleware to ensure only one featured testimonial globally
videoTestimonialSchema.pre('save', async function(next) {
  if (this.isFeatured && this.isModified('isFeatured')) {
    // If this testimonial is being featured, unfeature all others
    await (this.constructor as any).updateMany(
        { 
          _id: { $ne: this._id },
          isFeatured: true 
        },
        { isFeatured: false }
      );
  }
  next();
});

// Static method to get featured testimonials
videoTestimonialSchema.statics.getFeatured = function() {
  return this.find({ isFeatured: true })
    .sort({ createdAt: -1 });
};


// Instance method to feature testimonial
videoTestimonialSchema.methods.feature = function() {
  this.isFeatured = true;
  return this.save();
};

// Instance method to unfeature testimonial
videoTestimonialSchema.methods.unfeature = function() {
  this.isFeatured = false;
  return this.save();
};

export const VideoTestimonial = mongoose.models.VideoTestimonial || 
  mongoose.model<IVideoTestimonial>('VideoTestimonial', videoTestimonialSchema);
