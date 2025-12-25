"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import type { Car, PopulatedCategory } from "@/types/car"
import type { Category } from "@/types/category"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CarCard } from "@/components/car/CarCard"
import { frontendServices } from "@/lib/services/frontendServices"
import { CarIcon, Grid3X3, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useCategories } from "@/hooks/useApi"
import { Header } from "../../home/components/Header"

export default function CategoryPage() {
  const params = useParams()
  const categoryId = params?.id as string
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryName, setCategoryName] = useState<string>("")
  const [categoryObj, setCategoryObj] = useState<Category | null>(null)

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

  const loadCarsByCategory = useCallback(async () => {
    try {
      setLoading(true)
      const decodedId = decodeURIComponent(categoryId)

      // First, try to find the category by ID
      const categoriesResponse: unknown = await frontendServices.getCategoriesWithCarCounts()
      let categoriesArr: Category[] = []

      if (categoriesResponse && typeof categoriesResponse === 'object') {
        const response = categoriesResponse as { categories?: Category[]; data?: Category[] }
        if (Array.isArray(response.categories)) {
          categoriesArr = response.categories
        } else if (Array.isArray(response.data)) {
          categoriesArr = response.data
        }
      }

      let category: Category | undefined = categoriesArr.find((cat: Category) => cat.id === decodedId)

      if (!category) {
        // If not found by ID, try by name (fallback)
        category = categoriesArr.find(
          (cat: Category) => cat.name && cat.name.toLowerCase() === decodedId.toLowerCase(),
        )
      }

      if (category) {
        setCategoryName(category.name)
        setCategoryObj(category)

        // Use categoryId to fetch cars
        const response = await frontendServices.getCars({
          categoryId: category.id || '',
          limit: 50, // Get more cars for category pages
        })
        setCars((response.data as unknown as Car[]) || [])
      } else {
        // Fallback to category name if ID not found
        setCategoryName(decodedId)
        setCategoryObj(null)
        const response = await frontendServices.getCars({
          category: decodedId,
          limit: 50,
        })
        setCars((response.data as unknown as Car[]) || [])
      }
    } catch (error) {
      console.error("Error loading cars:", error)
      setCars([])
    } finally {
      setLoading(false)
    }
  }, [categoryId])

  useEffect(() => {
    loadCarsByCategory()
  }, [categoryId, loadCarsByCategory])

  if (loading || categoriesLoading) {
    return <CategoryPageSkeleton />
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      {/* Hero Section */}
      {categoryObj && (
        <div className="bg-gray-900/80 border-b border-gray-700 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                {/* Category Image */}
                <div className="flex-shrink-0">
                  <div className="w-full lg:w-80 h-48 lg:h-56 bg-gray-800/80 rounded-2xl shadow-2xl border border-gray-600 overflow-hidden backdrop-blur-sm">
                  <Image
                    src={categoryObj.image || "/placeholder.svg?height=224&width=320"}
                    alt={categoryObj.name}
                    width={320}
                    height={224}
                    className="w-full h-full object-cover"
                  />
                  </div>
                </div>

                {/* Category Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-4">
                    <h1 className="text-4xl lg:text-5xl font-bold text-white">{categoryObj.name}</h1>
                    <Badge variant="secondary" className="text-sm bg-gray-700 text-gray-200 border-gray-600">
                      {cars.length} {cars.length === 1 ? "Car" : "Cars"}
                    </Badge>
                  </div>

                  {categoryObj.description && (
                    <p className="text-lg text-gray-300 leading-relaxed mb-6">{categoryObj.description}</p>
                  )}

                  {/* Category Stats */}
                  <div className="flex flex-wrap gap-6 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <CarIcon className="w-4 h-4" />
                      <span>{cars.length} vehicles available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Grid3X3 className="w-4 h-4" />
                      <span>{categoryObj.name} category</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cars Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {cars.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{categoryName} Cars</h2>
                  <p className="text-gray-400">
                    Found {cars.length} {cars.length === 1 ? "car" : "cars"} in this category
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {cars.map((car) => (
                  <div key={car.id} className="group">
                    <CarCard
                      car={car}
                      carTypeNames={(car.carTypeIds || []).map((id) => carTypeMap[getId(id)]).filter(Boolean)}
                      transmissionNames={(car.transmissionIds || []).map((id) => transmissionMap[getId(id)]).filter(Boolean)}
                      fuelTypeNames={(car.fuelTypeIds || []).map((id) => fuelTypeMap[getId(id)]).filter(Boolean)}
                      tagNames={(car.tagIds || []).map((id) => tagMap[getId(id)]).filter(Boolean)}
                      className="h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-gray-800/50 border-gray-700 backdrop-blur-sm"
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-800/50 rounded-full flex items-center justify-center">
                <CarIcon className="w-12 h-12 text-gray-500" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">No Cars Found</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                We couldn&apos;t find any cars in the &apos;{categoryName}&apos; category. Check back later for new arrivals or explore
                other categories.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Go Back
                </Button>
                <Button onClick={() => (window.location.href = "/")} className="bg-[#44caad] hover:bg-[#3ab89a]">
                  Browse All Cars
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CategoryPageSkeleton() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      {/* Hero Skeleton */}
      <div className="bg-gray-900/80 border-b border-gray-700 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
              <Skeleton className="w-full lg:w-80 h-48 lg:h-56 rounded-2xl bg-gray-700/50" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-12 w-64 bg-gray-700/50" />
                <Skeleton className="h-6 w-full max-w-lg bg-gray-700/50" />
                <Skeleton className="h-6 w-full max-w-md bg-gray-700/50" />
                <div className="flex gap-4">
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
