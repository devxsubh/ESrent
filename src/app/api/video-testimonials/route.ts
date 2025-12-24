import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { VideoTestimonial } from '@/lib/models/videoTestimonialSchema';
import { CloudinaryService } from '@/lib/cloudinary.server';

// GET - Fetch all video testimonials
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const approved = searchParams.get('approved');
    const limit = searchParams.get('limit');
    
    // eslint-disable-next-line prefer-const
    let query: any = {};
    
    if (featured === 'true') {
      query.isFeatured = true;
    }
    
    // 'isApproved' no longer used; keep backward-compat by ignoring the filter
    
    const testimonials = await VideoTestimonial.find(query)
      .sort({ createdAt: -1 })
      .limit(limit ? parseInt(limit) : 100);
    
    return NextResponse.json({
      success: true,
      data: testimonials,
      message: 'Video testimonials fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching video testimonials:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch video testimonials' },
      { status: 500 }
    );
  }
}

// POST - Create new video testimonial
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const formData = await request.formData();
    
    // Extract form fields
    const title = formData.get('title') as string;
    const comment = formData.get('comment') as string;
    const videoFile = formData.get('video') as File;
    const thumbnailFile = formData.get('thumbnail') as File;
    
    // Validate required fields
    if (!title || !comment || !videoFile) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, comment, and video are required' },
        { status: 400 }
      );
    }
    
    // rating and userRole no longer required (admin-only)
    
    // Upload video to Cloudinary
    const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
    const videoResult = await CloudinaryService.uploadVideo(
      videoBuffer, 
      'video-testimonials',
      {
      public_id: `video-${Date.now()}`,
      }
    );
    
    if (!videoResult) {
      return NextResponse.json(
        { success: false, error: 'Failed to upload video' },
        { status: 500 }
      );
    }
    
    // Upload thumbnail if provided
    let thumbnailUrl = undefined;
    if (thumbnailFile) {
      const thumbnailBuffer = Buffer.from(await thumbnailFile.arrayBuffer());
      const thumbnailResult = await CloudinaryService.uploadImage(thumbnailBuffer, 'video-testimonials/thumbnails', {
        public_id: `thumbnail-${Date.now()}`,
      });
      
      if (thumbnailResult) {
        thumbnailUrl = thumbnailResult.secure_url;
      }
    }
    
    // Create video testimonial
    const videoTestimonial = new VideoTestimonial({
      title,
      comment,
      videoUrl: videoResult.secure_url,
      thumbnailUrl,
      duration: videoResult.duration,
      isFeatured: false, // Default to not featured
    });
    
    await videoTestimonial.save();
    
    return NextResponse.json({
      success: true,
      data: videoTestimonial,
      message: 'Video testimonial created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating video testimonial:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create video testimonial' },
      { status: 500 }
    );
  }
}
