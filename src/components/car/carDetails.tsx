"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useCar, useCategories, useBrand } from "@/hooks/useApi"
import { ReviewSection } from "./ReviewSection"
import { Header } from "@/app/(root)/home/components/Header"
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Fuel,
  Settings,
  Car,
  Users,
  Shield,
  Truck,
  Clock
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface CarDetailsInterface {
  images: string[]
  available: boolean
  name: string
  originalPrice: number
  discountedPrice?: number
  year: number
  transmission?: string
  seater?: number
  engine?: string
  mileage?: string
  fuel?: string
  category?: string
  tags?: string[]
  description?: string
  brand?: string
  brandId?: string | { id: string; name: string; logo: string }
  model?: string
  carTypeIds?: string[]
  transmissionIds?: string[]
  fuelTypeIds?: string[]
  tagIds?: string[]
}

export default function CarDetails() {
  const params = useParams()
  const router = useRouter()
  const carId = params.id as string
  const [isClient, setIsClient] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const {
    data: car,
    loading,
    error,
  } = useCar(carId) as { data: CarDetailsInterface | null; loading: boolean; error: Error | null }

  const brandIdValue = typeof car?.brandId === 'string' ? car.brandId : car?.brandId?.id || "";
  const { data: brandData } = useBrand(brandIdValue);
  
  // Debug brand data
  useEffect(() => {
    if (brandData) {
          // console.log('Brand data:', brandData);
          // console.log('Car brandId:', brandIdValue);
      if (brandData.data && Array.isArray(brandData.data)) {
        const brand = brandData.data.find(b => b.id === brandIdValue);
        // console.log('Found brand:', brand);
        // console.log('Brand logo URL:', brand?.logo);
      }
    }
  }, [brandData, brandIdValue]);

  const { data: categoriesData, loading: categoriesLoading } = useCategories()
  const categories = categoriesData?.data || []

  // Build lookup maps
  type CategoryMap = Record<string, string>;
  
  const carTypeMap: CategoryMap = categories
    .filter((c): c is { id: string; name: string; type: string } => c.type === "carType" && !!c.id)
    .reduce((acc: CategoryMap, c) => {
      if (c.id) acc[c.id] = c.name
      return acc
    }, {})

  const transmissionMap: CategoryMap = categories
    .filter((c): c is { id: string; name: string; type: string } => c.type === "transmission" && !!c.id)
    .reduce((acc: CategoryMap, c) => {
      if (c.id) acc[c.id] = c.name
      return acc
    }, {})

  const fuelTypeMap: CategoryMap = categories
    .filter((c): c is { id: string; name: string; type: string } => c.type === "fuelType" && !!c.id)
    .reduce((acc: CategoryMap, c) => {
      if (c.id) acc[c.id] = c.name
      return acc
    }, {})

  const tagMap: CategoryMap = categories
    .filter((c): c is { id: string; name: string; type: string } => c.type === "tag" && !!c.id)
    .reduce((acc: CategoryMap, c) => {
      if (c.id) acc[c.id] = c.name
      return acc
    }, {})

  // Map car fields to names
  const carTypeNames = (car?.carTypeIds || []).map((id: string) => carTypeMap[id]).filter(Boolean)
  const transmissionNames = (car?.transmissionIds || []).map((id: string) => transmissionMap[id]).filter(Boolean)
  const fuelTypeNames = (car?.fuelTypeIds || []).map((id: string) => fuelTypeMap[id]).filter(Boolean)
  const tagNames = (car?.tagIds || []).map((id: string) => tagMap[id]).filter(Boolean)

  const handleBackClick = () => {
    if (!isClient) return
    const storedPreviousPage = localStorage.getItem("previousPage")
    localStorage.removeItem("previousPage")
    if (storedPreviousPage === "brand") {
      router.back()
    } else {
      router.push("/cars")
    }
  }

  const nextImage = () => {
    if (car?.images && car.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % car.images.length)
    }
  }

  const prevImage = () => {
    if (car?.images && car.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + car.images.length) % car.images.length)
    }
  }

  if (!isClient) {
    return <CarDetailsSkeleton />
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 max-w-6xl mx-auto w-full p-4 flex items-center justify-center">
          <Card className="bg-card border-border/50 shadow-xl">
          <CardContent className="p-8 text-center">
              <Car className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h1 className="text-2xl font-semibold mb-4 text-foreground">Error Loading Car</h1>
              <p className="text-muted-foreground mb-6">Something went wrong while loading the car details.</p>
              <Button onClick={() => window.location.reload()} className="gap-2">
              Try Again
            </Button>
          </CardContent>
        </Card>
        </main>
      </div>
    )
  }

  if (loading || categoriesLoading) {
    return <CarDetailsSkeleton />
  }

  if (!car) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 max-w-6xl mx-auto w-full p-4 flex items-center justify-center">
          <Card className="bg-card border-border/50 shadow-xl">
          <CardContent className="p-8 text-center">
              <Car className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h1 className="text-2xl font-semibold mb-4 text-foreground">Car Not Found</h1>
              <p className="text-muted-foreground mb-6">The car you&apos;re looking for doesn&apos;t exist.</p>
              <Button onClick={handleBackClick} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
        </main>
      </div>
    )
  }


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full p-4">
        {/* Back Link */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Image Gallery */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl bg-card shadow-xl border border-border/50">
                <Image
                  src={car.images?.[currentImageIndex] || "/placeholder.svg?height=500&width=700"}
                  alt={car.name}
                  width={700}
                  height={500}
                  className="w-full h-[400px] md:h-[500px] object-cover"
                  priority
                />
                {/* Image Navigation */}
                {car.images && car.images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground backdrop-blur-sm border border-border/50"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground backdrop-blur-sm border border-border/50"
                      onClick={nextImage}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </Button>
                  </>
                )}
                
                {/* Image Dots */}
                {car.images && car.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {car.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex 
                            ? 'bg-primary w-6' 
                            : 'bg-white/50 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Thumbnail Strip */}
            {car.images && car.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {car.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex 
                        ? 'border-primary' 
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${car.name} ${index + 1}`}
                      width={80}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            {car.description && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-foreground mb-3">Description</h3>
                <div 
                  className="text-muted-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none bg-card rounded-xl p-4 border border-border/50"
                  dangerouslySetInnerHTML={{ __html: car.description }}
                />
              </div>
            )}

            {/* Reviews Section */}
            <div className="mt-8">
              <ReviewSection carId={carId} />
            </div>
          </div>

          {/* Right Side - Booking Card (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Car Info Card */}
              <Card className="bg-card border-border/50 shadow-xl overflow-hidden">
                <CardContent className="p-6 space-y-6">
            {/* Car Header */}
                  <div className="space-y-3">
              <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg bg-background border border-border/50 overflow-hidden">
                  {(() => {
                    let brandLogo = null;
                    let brandName = null;
                    
                    if (brandData && brandData.data && Array.isArray(brandData.data)) {
                      const brand = brandData.data.find(b => b.id === brandIdValue);
                      if (brand && brand.logo) {
                        brandLogo = brand.logo;
                        brandName = brand.name;
                      }
                    }
                    
                    if (!brandLogo && car.brand) {
                      brandName = car.brand;
                    }
                    
                    return brandLogo ? (
                      <Image
                        src={brandLogo}
                        alt={brandName || "Brand Logo"}
                        width={48}
                        height={48}
                              className="object-contain w-10 h-10"
                      />
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center">
                        {brandName ? (
                                <span className="text-muted-foreground font-bold text-sm">
                            {brandName.substring(0, 2).toUpperCase()}
                          </span>
                        ) : (
                                <Car className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                    );
                  })()}
                </div>
                      <div>
                        <h1 className="text-xl font-bold text-foreground">{car.name}</h1>
                        <p className="text-sm text-muted-foreground">{car.brand} {car.model}</p>
              </div>
            </div>

                    {/* Availability Badge */}
                    <Badge 
                      variant={car.available ? "default" : "destructive"}
                      className={car.available ? "bg-green-500/10 text-green-600 border-green-500/20" : ""}
                    >
                      {car.available ? "Available" : "Not Available"}
                    </Badge>
                  </div>

                  {/* Quick Specs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">{car.seater || "N/A"} Seats</span>
                  </div>
                    <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
                      <Settings className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">{transmissionNames[0] || "Auto"}</span>
                </div>
                    <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
                      <Fuel className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">{fuelTypeNames[0] || "Petrol"}</span>
                  </div>
                    <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
                      <Car className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">{carTypeNames[0] || "Sedan"}</span>
              </div>
            </div>

            {/* Tags */}
                  {tagNames.length > 0 && (
              <div className="flex flex-wrap gap-2">
                      {tagNames.map((tag: string, idx: number) => (
                    <Badge
                      key={idx}
                      variant="outline"
                          className="text-xs"
                    >
                      {tag}
                    </Badge>
                      ))}
          </div>
        )}

                  {/* Price */}
                  <div className="border-t border-border/50 pt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Price per day</span>
                      <div className="flex items-center gap-2">
                        {car.discountedPrice && car.discountedPrice < car.originalPrice && (
                          <span className="text-muted-foreground line-through text-sm">
                  AED {car.originalPrice.toLocaleString()}
                </span>
                        )}
                        <span className="font-bold text-primary text-lg">
                AED {(car.discountedPrice || car.originalPrice || 0).toLocaleString()}
              </span>
                      </div>
          </div>
        </div>

                  {/* Book Now Button */}
                  <Link href={`/book/${carId}`} className="block">
                    <Button className="w-full gap-2 py-6 text-lg font-semibold">
                      <Calendar className="w-5 h-5" />
                      Book Now – No Advance
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Trust Badges */}
              <Card className="bg-card border-border/50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">No Advance Payment</p>
                      <p className="text-xs text-muted-foreground">Pay when you pickup</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Truck className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Free Delivery</p>
                      <p className="text-xs text-muted-foreground">We deliver to you</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">24/7 Support</p>
                      <p className="text-xs text-muted-foreground">Always here to help</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
      </div>
      </main>
    </div>
  )
}

function CarDetailsSkeleton() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Skeleton */}
      <div className="w-full bg-background/80 backdrop-blur-lg border-b border-border h-24">
        <div className="relative w-full max-w-7xl mx-auto h-24">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Skeleton className="w-20 h-20 rounded" />
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex gap-4">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-20" />
        </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4">
        <Skeleton className="h-6 w-32 mb-6" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Image */}
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[400px] md:h-[500px] w-full rounded-2xl" />
            <div className="flex gap-2">
              <Skeleton className="w-20 h-16 rounded-lg" />
              <Skeleton className="w-20 h-16 rounded-lg" />
              <Skeleton className="w-20 h-16 rounded-lg" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          </div>

          {/* Right Side - Booking Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card rounded-xl border border-border/50 p-6 space-y-6">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-12 rounded-lg" />
                <Skeleton className="h-12 rounded-lg" />
                <Skeleton className="h-12 rounded-lg" />
                <Skeleton className="h-12 rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-16 rounded-lg" />
                <Skeleton className="h-16 rounded-lg" />
            </div>
              <div className="space-y-2 pt-4 border-t">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            
            <div className="bg-card rounded-xl border border-border/50 p-4 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
