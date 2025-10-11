# API Documentation

## Base URL

```
Development: http://localhost:3000
Production: https://esrent.ae
```

## Authentication

Most admin endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

---

## Authentication Endpoints

### POST /api/auth/register
Register a new admin user.

**Request Body:**
```json
{
  "email": "admin@esrent.ae",
  "password": "securepassword",
  "name": "Admin Name"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "_id": "user_id",
    "email": "admin@esrent.ae",
    "name": "Admin Name",
    "role": "admin"
  }
}
```

### POST /api/auth/login
Login and receive JWT token.

**Request Body:**
```json
{
  "email": "admin@esrent.ae",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id",
    "email": "admin@esrent.ae",
    "name": "Admin Name",
    "role": "admin"
  }
}
```

### POST /api/auth/verify
Verify JWT token validity.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "email": "admin@esrent.ae",
    "role": "admin"
  }
}
```

### POST /api/auth/logout
Logout user (client-side token removal).

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Car Endpoints

### GET /api/cars
List all cars with optional filters.

**Query Parameters:**
- `limit` (number, optional): Number of results per page (default: 12)
- `page` (number, optional): Page number (default: 1)
- `featured` (boolean, optional): Filter by featured status
- `brand` (string, optional): Filter by brand ID
- `category` (string, optional): Filter by category ID
- `minPrice` (number, optional): Minimum price filter
- `maxPrice` (number, optional): Maximum price filter
- `transmission` (string, optional): Filter by transmission type
- `fuelType` (string, optional): Filter by fuel type
- `search` (string, optional): Search query

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "car_id",
      "name": "Ferrari 488 GTB",
      "brand": {
        "_id": "brand_id",
        "name": "Ferrari",
        "logo": "https://cloudinary.com/..."
      },
      "category": {
        "_id": "category_id",
        "name": "Sports",
        "type": "sports"
      },
      "description": "A stunning supercar...",
      "price": 2500,
      "images": ["url1", "url2"],
      "specs": {
        "transmission": "Automatic",
        "fuelType": "Petrol",
        "horsepower": 661,
        "seats": 2,
        "year": 2023
      },
      "featured": true,
      "available": true,
      "viewCount": 1250,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 12
  }
}
```

### GET /api/cars/[id]
Get a single car by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "car_id",
    "name": "Ferrari 488 GTB",
    "brand": { ... },
    "category": { ... },
    "description": "Detailed description...",
    "price": 2500,
    "images": ["url1", "url2", "url3"],
    "specs": { ... },
    "featured": true,
    "available": true,
    "viewCount": 1251,
    "averageRating": 4.8,
    "reviewCount": 24,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /api/cars
Create a new car. **Requires Authentication**

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Ferrari 488 GTB",
  "brand": "brand_id",
  "category": "category_id",
  "description": "A stunning supercar...",
  "price": 2500,
  "images": ["url1", "url2"],
  "specs": {
    "transmission": "Automatic",
    "fuelType": "Petrol",
    "horsepower": 661,
    "seats": 2,
    "year": 2023
  },
  "featured": false,
  "available": true
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Car created successfully"
}
```

### PUT /api/cars/[id]
Update a car. **Requires Authentication**

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:** (Partial update supported)
```json
{
  "name": "Ferrari 488 GTB Spider",
  "price": 2800,
  "available": false
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Car updated successfully"
}
```

### DELETE /api/cars/[id]
Delete a car. **Requires Authentication**

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Car deleted successfully"
}
```

### GET /api/cars/list
Get a simple list of cars for dropdowns.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "car_id",
      "name": "Ferrari 488 GTB",
      "brand": "Ferrari",
      "price": 2500
    }
  ]
}
```

---

## Brand Endpoints

### GET /api/brands
List all brands.

**Query Parameters:**
- `limit` (number, optional): Number of results
- `featured` (boolean, optional): Filter by featured status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "brand_id",
      "name": "Ferrari",
      "slug": "ferrari",
      "logo": "https://cloudinary.com/...",
      "description": "Italian luxury sports car manufacturer",
      "featured": true,
      "carCount": 12,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /api/brands/[id]
Get a single brand by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "brand_id",
    "name": "Ferrari",
    "slug": "ferrari",
    "logo": "https://cloudinary.com/...",
    "description": "Detailed description...",
    "featured": true,
    "carCount": 12,
    "cars": [ ... ]  // Populated with car objects
  }
}
```

### POST /api/brands
Create a new brand. **Requires Authentication**

**Request Body:**
```json
{
  "name": "Ferrari",
  "slug": "ferrari",
  "logo": "https://cloudinary.com/...",
  "description": "Italian luxury sports car manufacturer",
  "featured": true
}
```

### PUT /api/brands/[id]
Update a brand. **Requires Authentication**

### DELETE /api/brands/[id]
Delete a brand. **Requires Authentication**

---

## Category Endpoints

### GET /api/categories
List all categories.

**Query Parameters:**
- `type` (string, optional): Filter by type (luxury, sports, suv, etc.)
- `featured` (boolean, optional): Filter by featured status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "category_id",
      "name": "Sports Cars",
      "slug": "sports-cars",
      "type": "sports",
      "description": "High-performance sports vehicles",
      "image": "https://cloudinary.com/...",
      "featured": true,
      "carCount": 25,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /api/categories/[id]
Get a single category by ID.

### POST /api/categories
Create a new category. **Requires Authentication**

### PUT /api/categories/[id]
Update a category. **Requires Authentication**

### DELETE /api/categories/[id]
Delete a category. **Requires Authentication**

---

## Review Endpoints

### GET /api/reviews
List reviews for a car.

**Query Parameters:**
- `carId` (string, required): Car ID
- `includeUnapproved` (boolean, optional): Include unapproved reviews (admin only)
- `limit` (number, optional): Number of results
- `page` (number, optional): Page number

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "review_id",
      "carId": "car_id",
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "rating": 5,
      "title": "Amazing Experience",
      "comment": "Best rental experience ever...",
      "isApproved": true,
      "isFeatured": false,
      "isAdminCreated": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /api/reviews
Submit a new review.

**Request Body:**
```json
{
  "carId": "car_id",
  "userName": "John Doe",
  "userEmail": "john@example.com",
  "rating": 5,
  "title": "Amazing Experience",
  "comment": "Best rental experience ever..."
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Review submitted successfully. It will be visible after approval."
}
```

### GET /api/reviews/[id]
Get a single review by ID.

### PUT /api/reviews/[id]
Update a review. **Requires Authentication**

### PATCH /api/reviews/[id]
Update review status. **Requires Authentication**

**Request Body:**
```json
{
  "action": "approve"  // or "reject", "toggleFeatured"
}
```

### DELETE /api/reviews/[id]
Delete a review. **Requires Authentication**

### GET /api/reviews/stats/[carId]
Get review statistics for a car.

**Response:**
```json
{
  "success": true,
  "data": {
    "averageRating": 4.6,
    "totalReviews": 24,
    "ratingDistribution": {
      "5": 15,
      "4": 6,
      "3": 2,
      "2": 1,
      "1": 0
    }
  }
}
```

---

## Video Testimonial Endpoints

### GET /api/video-testimonials
List all approved video testimonials.

**Query Parameters:**
- `limit` (number, optional): Number of results
- `includeUnapproved` (boolean, optional): Include unapproved (admin only)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "testimonial_id",
      "title": "Amazing Service",
      "description": "Had a wonderful experience...",
      "videoUrl": "https://cloudinary.com/video.mp4",
      "thumbnailUrl": "https://cloudinary.com/thumb.jpg",
      "isApproved": true,
      "isFeatured": true,
      "viewCount": 524,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /api/video-testimonials
Create a new video testimonial. **Requires Authentication**

**Request Body:**
```json
{
  "title": "Amazing Service",
  "description": "Had a wonderful experience...",
  "videoUrl": "https://cloudinary.com/video.mp4",
  "thumbnailUrl": "https://cloudinary.com/thumb.jpg",
  "isApproved": true,
  "isFeatured": false
}
```

### GET /api/video-testimonials/[id]
Get a single video testimonial by ID.

### PUT /api/video-testimonials/[id]
Update a video testimonial. **Requires Authentication**

### DELETE /api/video-testimonials/[id]
Delete a video testimonial. **Requires Authentication**

---

## File Upload Endpoint

### POST /api/upload
Upload an image or video to Cloudinary. **Requires Authentication**

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (FormData):**
```
file: <file>
folder: "cars" | "brands" | "categories" | "testimonials"
```

**Response:**
```json
{
  "success": true,
  "url": "https://res.cloudinary.com/.../image.jpg",
  "publicId": "folder/unique_id"
}
```

**File Constraints:**
- **Images**: JPEG, PNG, WebP, GIF
- **Videos**: MP4, MOV, AVI
- **Max Size**: 10MB for images, 100MB for videos

---

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication required |
| `INVALID_TOKEN` | Invalid or expired token |
| `INVALID_CREDENTIALS` | Invalid email or password |
| `VALIDATION_ERROR` | Request validation failed |
| `NOT_FOUND` | Resource not found |
| `ALREADY_EXISTS` | Resource already exists |
| `UPLOAD_ERROR` | File upload failed |
| `DATABASE_ERROR` | Database operation failed |
| `SERVER_ERROR` | Internal server error |

---

## Rate Limiting

*To be implemented*

## Pagination

Most list endpoints support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 12, max: 100)

**Response Includes:**
```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 12,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## Cursor-Based Pagination

For large datasets, use cursor-based pagination:

**Query Parameters:**
- `cursor`: Cursor from previous response
- `limit`: Items per page

**Response Includes:**
```json
{
  "data": [ ... ],
  "pagination": {
    "nextCursor": "encoded_cursor_string",
    "hasMore": true
  }
}
```

---

## OpenAPI/Swagger Specification

*Coming soon*

A full OpenAPI 3.0 specification will be available at `/api/docs` (to be implemented).

---

**Last Updated**: January 2025
**API Version**: 1.0

