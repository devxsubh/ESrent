"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CarCard } from "@/components/car/CarCard"
import { ErrorState } from "@/components/ui/empty-state"
import { useBrand, useCars, useCategories } from "@/hooks/useApi"
import { ArrowLeft, CarIcon, MapPin, Calendar } from "lucide-react"
import Image from 'next/image';
import { Car, PopulatedCategory } from "@/types/car";
import { Header } from "../../home/components/Header";

export default function BrandPage() {
  const params = useParams()
  // console.log("Brand page params:", params)
  const id = params.id as string
  const [isClient, setIsClient] = useState(false)

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  const { data: brandData, loading: brandLoading, error: brandError } = useBrand(id)
  const brand = brandData
  const { data: carsData, loading: carsLoading, error: carsError } = useCars(id ? { brandId: id } : undefined)
  const cars = carsData?.data || []
  const { data: categoriesData, loading: categoriesLoading } = useCategories();
  const categories = categoriesData?.data || [];

  // Helper function to extract ID from string or PopulatedCategory
  const getId = (item: string | PopulatedCategory): string => {
    return typeof item === 'string' ? item : item.id || '';
  };

  // Build lookup maps
  type CategoryMap = Record<string, string>;
  const carTypeMap: CategoryMap = categories
    .filter((c): c is { id: string; name: string; type: string } => c.type === 'carType' && !!c.id)
    .reduce((acc: CategoryMap, c) => { if (c.id) acc[c.id] = c.name; return acc; }, {});
  const transmissionMap: CategoryMap = categories
    .filter((c): c is { id: string; name: string; type: string } => c.type === 'transmission' && !!c.id)
    .reduce((acc: CategoryMap, c) => { if (c.id) acc[c.id] = c.name; return acc; }, {});
  const fuelTypeMap: CategoryMap = categories
    .filter((c): c is { id: string; name: string; type: string } => c.type === 'fuelType' && !!c.id)
    .reduce((acc: CategoryMap, c) => { if (c.id) acc[c.id] = c.name; return acc; }, {});
  const tagMap: CategoryMap = categories
    .filter((c): c is { id: string; name: string; type: string } => c.type === 'tag' && !!c.id)
    .reduce((acc: CategoryMap, c) => { if (c.id) acc[c.id] = c.name; return acc; }, {});

  if (!isClient) {
    return <BrandPageSkeleton />
  }

  if (brandError || carsError) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <ErrorState
            error={brandError || carsError || "Failed to load brand data"}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  if (brandLoading || carsLoading || categoriesLoading) {
    return <BrandPageSkeleton />
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-gray-800/50 border-gray-700 shadow-2xl backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-700/50 rounded-full flex items-center justify-center">
                  <CarIcon className="w-10 h-10 text-gray-400" />
                </div>
                <h1 className="text-3xl font-bold mb-4 text-white">Brand Not Found</h1>
                <p className="text-gray-300 mb-8 text-lg">
                  The brand you&apos;re looking for doesn&apos;t exist or may have been removed.
                </p>
                <Button onClick={() => window.history.back()} size="lg" className="gap-2 bg-[#44caad] hover:bg-[#3ab89a] text-white">
                  <ArrowLeft className="w-4 h-4" />
                  Go Back
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      {/* Hero Section */}
      <div className="bg-gray-900/80 border-b border-gray-700 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              {/* Brand Logo */}
              <div className="flex-shrink-0">
                {brand.logo ? (
                  <Image
                    src={typeof brand.logo === "string" ? brand.logo : "/fallback.png"}
                    alt={typeof brand.name === "string" ? brand.name : "Brand Logo"}
                    width={64}
                    height={64}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-muted-foreground">No logo</span>
                  </div>
                )}
              </div>

              {/* Brand Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-4xl md:text-5xl font-bold text-white">
                    {typeof brand.name === "string" ? brand.name : ""}
                  </h1>
                  <Badge variant="secondary" className="text-sm bg-gray-700 text-gray-200 border-gray-600">
                    {cars.length} {cars.length === 1 ? "Car" : "Cars"}
                  </Badge>
                </div>

                {typeof brand.description === "string" && (
                  <p className="text-lg text-gray-300 leading-relaxed mb-6">{brand.description}</p>
                )}

                {/* Brand Stats */}
                <div className="flex flex-wrap gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <CarIcon className="w-4 h-4" />
                    <span>{cars.length} vehicles available</span>
                  </div>
                  {typeof brand.country === "string" && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{brand.country}</span>
                    </div>
                  )}
                  {typeof brand.founded === "string" && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Founded {brand.founded}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cars Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Available Vehicles</h2>
              <p className="text-gray-400">
                Explore our collection of {typeof brand.name === "string" ? brand.name : ""} vehicles
              </p>
            </div>
          </div>

          {cars.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-800/50 rounded-full flex items-center justify-center">
                <CarIcon className="w-12 h-12 text-gray-500" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">No vehicles available</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                We don&apos;t have any {typeof brand.name === "string" ? brand.name : ""} vehicles in our inventory at the moment. Check back later for new arrivals.
              </p>
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Browse Other Brands
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cars.map((car) => {
                const safeCar = car as unknown as Car;
                return (
                  <div key={typeof safeCar.id === "string" || typeof safeCar.id === "number" ? safeCar.id : undefined} className="group">
                    <CarCard
                      car={safeCar}
                      onClick={() => {
                        if (isClient && typeof window !== "undefined") {
                          localStorage.setItem("previousPage", "brand")
                        }
                      }}
                      className="h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-gray-800/50 border-gray-700 backdrop-blur-sm"
                      carTypeNames={Array.isArray(safeCar.carTypeIds) ? safeCar.carTypeIds.map((id) => carTypeMap[getId(id)]).filter(Boolean) : []}
                      transmissionNames={Array.isArray(safeCar.transmissionIds) ? safeCar.transmissionIds.map((id) => transmissionMap[getId(id)]).filter(Boolean) : []}
                      fuelTypeNames={Array.isArray(safeCar.fuelTypeIds) ? safeCar.fuelTypeIds.map((id) => fuelTypeMap[getId(id)]).filter(Boolean) : []}
                      tagNames={Array.isArray(safeCar.tagIds) ? safeCar.tagIds.map((id) => tagMap[getId(id)]).filter(Boolean) : []}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function BrandPageSkeleton() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      {/* Hero Skeleton */}
      <div className="bg-gray-900/80 border-b border-gray-700 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gray-700/50" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-12 w-64 bg-gray-700/50" />
                <Skeleton className="h-6 w-full max-w-lg bg-gray-700/50" />
                <Skeleton className="h-6 w-full max-w-md bg-gray-700/50" />
                <div className="flex gap-4">
                  <Skeleton className="h-5 w-24 bg-gray-700/50" />
                  <Skeleton className="h-5 w-32 bg-gray-700/50" />
                  <Skeleton className="h-5 w-28 bg-gray-700/50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cars Section Skeleton */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2 bg-gray-700/50" />
            <Skeleton className="h-5 w-96 bg-gray-700/50" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden bg-gray-800/50 border-gray-700">
                <Skeleton className="h-48 w-full bg-gray-700/50" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4 bg-gray-700/50" />
                  <Skeleton className="h-4 w-1/2 bg-gray-700/50" />
                  <Skeleton className="h-5 w-1/3 bg-gray-700/50" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
