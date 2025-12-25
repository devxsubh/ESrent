"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Upload, 
  Play, 
  Edit, 
  Trash2, 
  Eye, 
  Video,
  Calendar,
  Star,
  Loader2,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { toast } from '@/components/hooks/use-toast';
import { VideoThumbnail } from "@/components/ui/video-thumbnail";

interface VideoTestimonial {
  _id: string;
  title: string;
  comment: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface VideoTestimonialForm {
  title: string;
  comment: string;
  videoFile?: File;
  thumbnailFile?: File;
}

export default function VideoTestimonialsPage() {
  const [videoTestimonials, setVideoTestimonials] = useState<VideoTestimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<VideoTestimonial | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | undefined>(undefined);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | undefined>(undefined);
  const [formData, setFormData] = useState<VideoTestimonialForm>({
    title: '',
    comment: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState<string>('all');

  // Fetch video testimonials
  const fetchVideoTestimonials = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/video-testimonials');
      if (response.ok) {
        const data = await response.json();
        setVideoTestimonials(data.data || []);
      } else {
        throw new Error('Failed to fetch video testimonials');
      }
    } catch (error) {
      console.error('Error fetching video testimonials:', error);
      toast({
        title: "Error",
        description: "Failed to fetch video testimonials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideoTestimonials();
  }, []);

  // Handle form input changes
  const handleInputChange = (field: keyof VideoTestimonialForm, value: string | number | File) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle file selection
  const handleFileSelect = (field: 'videoFile' | 'thumbnailFile', file: File) => {
    if (field === 'videoFile') {
      // Validate video file
      const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a valid video file (MP4, WebM, OGG, or MOV)",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Video file must be smaller than 100MB",
          variant: "destructive",
        });
        return;
      }
    }

    if (field === 'thumbnailFile') {
      // Validate thumbnail file
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a valid image file (JPEG, PNG, or WebP)",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Thumbnail file must be smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
    }

    // Create local preview and store file
    if (field === 'videoFile') {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
      setVideoPreviewUrl(URL.createObjectURL(file));
    } else if (field === 'thumbnailFile') {
      if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
      setThumbnailPreviewUrl(URL.createObjectURL(file));
    }

    handleInputChange(field, file);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      comment: '',
    });
    setEditingTestimonial(null);
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
    setVideoPreviewUrl(undefined);
    setThumbnailPreviewUrl(undefined);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.videoFile) {
      toast({
        title: "Video required",
        description: "Please select a video file",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('comment', formData.comment);
      formDataToSend.append('video', formData.videoFile);
      
      if (formData.thumbnailFile) {
        formDataToSend.append('thumbnail', formData.thumbnailFile);
      }

      const url = editingTestimonial 
        ? `/api/video-testimonials/${editingTestimonial._id}`
        : '/api/video-testimonials';
      
      const method = editingTestimonial ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (response.ok) {
        const message = editingTestimonial 
          ? 'Video testimonial updated successfully'
          : 'Video testimonial uploaded successfully';
        
        toast({
          title: "Success",
          description: message,
        });
        
        setIsDialogOpen(false);
        resetForm();
        fetchVideoTestimonials();
      } else {
        throw new Error('Failed to save video testimonial');
      }
    } catch (error) {
      console.error('Error saving video testimonial:', error);
      toast({
        title: "Error",
        description: "Failed to save video testimonial",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle approval toggle
  // Approval no longer needed (admin-only upload)

  // Handle featured toggle
  const handleFeaturedToggle = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/video-testimonials/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isFeatured: !currentStatus }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Video testimonial ${currentStatus ? 'unfeatured' : 'featured'} successfully`,
        });
        fetchVideoTestimonials();
      } else {
        throw new Error('Failed to update featured status');
      }
    } catch (error) {
      console.error('Error updating featured status:', error);
      toast({
        title: "Error",
        description: "Failed to update featured status",
        variant: "destructive",
      });
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video testimonial?')) {
      return;
    }

    try {
      const response = await fetch(`/api/video-testimonials/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Video testimonial deleted successfully",
        });
        fetchVideoTestimonials();
      } else {
        throw new Error('Failed to delete video testimonial');
      }
    } catch (error) {
      console.error('Error deleting video testimonial:', error);
      toast({
        title: "Error",
        description: "Failed to delete video testimonial",
        variant: "destructive",
      });
    }
  };

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
      if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
    };
  }, [videoPreviewUrl, thumbnailPreviewUrl]);

  // Edit testimonial
  const handleEdit = (testimonial: VideoTestimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      title: testimonial.title,
      comment: testimonial.comment,
    });
    setIsDialogOpen(true);
  };

  // Open dialog for new testimonial
  const openNewDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Format duration
  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get status badge
  const getStatusBadge = (testimonial: VideoTestimonial) => {
    if (testimonial.isFeatured) {
      return (
        <Badge className="bg-primary/10 text-primary border border-primary/20 inline-flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-500" /> Featured
        </Badge>
      );
    }
    return null;
  };
  

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Video Testimonials</h1>
            <p className="text-muted-foreground">Manage customer video testimonials</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-40 w-full bg-muted animate-pulse" />
              <CardContent className="p-4 space-y-2">
                <div className="h-5 w-2/3 bg-muted animate-pulse rounded" />
                <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                <div className="h-3 w-1/3 bg-muted animate-pulse rounded" />
                <div className="h-9 w-full bg-muted animate-pulse rounded mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = {
    total: videoTestimonials.length,
    featured: videoTestimonials.filter(v => v.isFeatured).length,
    standard: videoTestimonials.filter(v => !v.isFeatured).length,
  };

  const filteredTestimonials = videoTestimonials.filter(testimonial => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!testimonial.title.toLowerCase().includes(query) && 
          !testimonial.comment.toLowerCase().includes(query)) {
        return false;
      }
    }
    if (featuredFilter === 'featured' && !testimonial.isFeatured) {
      return false;
    }
    if (featuredFilter === 'standard' && testimonial.isFeatured) {
      return false;
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Video className="w-7 h-7 text-primary" />
            Video Testimonials
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage customer video testimonials
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={fetchVideoTestimonials} variant="outline" className="gap-2">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Upload Video Testimonial
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTestimonial ? 'Edit Video Testimonial' : 'Upload Video Testimonial'}
              </DialogTitle>
              <DialogDescription>
                {editingTestimonial 
                  ? 'Update the video testimonial details below'
                  : 'Upload a new video testimonial from your customers'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Testimonial Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                  placeholder="Amazing service experience"
                />
              </div>
              
              <div>
                <Label htmlFor="comment">Testimonial Comment *</Label>
                <Textarea
                  id="comment"
                  value={formData.comment}
                  onChange={(e) => handleInputChange('comment', e.target.value)}
                  required
                  placeholder="Share your experience..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="video">Video File *</Label>
                <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 bg-muted/20">
                  {videoPreviewUrl ? (
                    <div className="space-y-3">
                      <video
                        src={videoPreviewUrl}
                        controls
                        className="w-full max-h-64 rounded-md border border-border/50"
                        poster={thumbnailPreviewUrl}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
                            setVideoPreviewUrl(undefined);
                            setFormData(prev => ({ ...prev, videoFile: undefined }));
                          }}
                          className="border-border/50"
                        >
                          Remove Video
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('video')?.click()}
                          className="border-border/50"
                        >
                          Replace Video
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Click to select video file
                      </p>
                      <p className="text-xs text-muted-foreground/80 mb-4">
                        Supported formats: MP4, WebM, OGG, MOV (Max: 100MB)
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('video')?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                          </>
                        ) : (
                          'Select Video'
                        )}
                      </Button>
                    </div>
                  )}
                  <Input
                    id="video"
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect('videoFile', file);
                    }}
                    className="hidden"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="thumbnail">Thumbnail Image (Optional)</Label>
                <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 bg-muted/20">
                  {thumbnailPreviewUrl ? (
                    <div className="space-y-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbnailPreviewUrl}
                        alt="Thumbnail preview"
                        className="w-full max-h-48 object-cover rounded-md border border-border/50"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
                            setThumbnailPreviewUrl(undefined);
                            setFormData(prev => ({ ...prev, thumbnailFile: undefined }));
                          }}
                          className="border-border/50"
                        >
                          Remove Thumbnail
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('thumbnail')?.click()}
                          className="border-border/50"
                        >
                          Replace Thumbnail
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Click to select thumbnail
                      </p>
                      <p className="text-xs text-muted-foreground/80 mb-2">
                        Supported formats: JPEG, PNG, WebP (Max: 5MB)
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('thumbnail')?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Select Thumbnail
                      </Button>
                    </div>
                  )}
                  <Input
                    id="thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect('thumbnailFile', file);
                    }}
                    className="hidden"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingTestimonial ? 'Updating...' : 'Uploading...'}
                    </>
                  ) : (
                    editingTestimonial ? 'Update Testimonial' : 'Upload Testimonial'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Videos</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Video className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Featured</p>
                <p className="text-2xl font-bold text-purple-600">{stats.featured}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Standard</p>
                <p className="text-2xl font-bold text-blue-600">{stats.standard}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Video className="w-5 h-5 text-blue-600" />
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
            placeholder="Search by title, comment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Videos</SelectItem>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="standard">Standard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Video Testimonials Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredTestimonials.length === 0 ? (
        <Card className="bg-card border-border/50">
          <CardContent className="p-12 text-center">
            <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Video Testimonials Found</h3>
            <p className="text-muted-foreground">
              {searchQuery || featuredFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start by uploading your first video testimonial'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTestimonials.map((testimonial) => (
            <Card key={testimonial._id} className="bg-card border-border/50 hover:shadow-lg transition-shadow overflow-hidden group">
              <div className="relative h-40 w-full bg-muted">
                <VideoThumbnail
                  videoUrl={testimonial.videoUrl}
                  thumbnailUrl={testimonial.thumbnailUrl}
                  alt="Video thumbnail"
                  className="w-full h-full"
                  time={1}
                  fallbackIcon={<Video className="h-8 w-8 text-muted-foreground" />}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/60 rounded-full p-3">
                    <Play className="h-5 w-5 text-white" />
                  </div>
                </div>
                {testimonial.duration && (
                  <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(testimonial.duration)}
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base truncate">{testimonial.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(testimonial)}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{testimonial.comment}</p>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(testimonial.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(testimonial.videoUrl, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(testimonial)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFeaturedToggle(testimonial._id, testimonial.isFeatured)}
                    className="col-span-2"
                  >
                    {testimonial.isFeatured ? (
                      <>
                        <Star className="h-4 w-4 mr-2" />
                        Unfeature
                      </>
                    ) : (
                      <>
                        <Star className="h-4 w-4 mr-2" />
                        Feature
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(testimonial._id)}
                    className="col-span-2"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

