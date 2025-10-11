# Architecture Documentation

## System Overview

ESrent.ae is a modern, full-stack luxury car rental platform built using Next.js 15 with the App Router, React 19, TypeScript, and MongoDB. The application follows a clean architecture pattern with clear separation between presentation, business logic, and data access layers.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                   │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    Next.js App Router (React 19)                 │   │
│  │  ┌────────────────┐  ┌──────────────┐  ┌────────────────────┐   │   │
│  │  │  Public Pages  │  │ Admin Panel  │  │  Shared Components  │   │   │
│  │  │  - Home        │  │  - Dashboard │  │  - Header/Footer    │   │   │
│  │  │  - Cars        │  │  - Cars Mgmt │  │  - Car Cards        │   │   │
│  │  │  - Brands      │  │  - Brands    │  │  - Forms/Dialogs    │   │   │
│  │  │  - Categories  │  │  - Reviews   │  │  - Loading States   │   │   │
│  │  │  - Car Details │  │  - Videos    │  │  - Error States     │   │   │
│  │  └────────────────┘  └──────────────┘  └────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│         │                        │                        │              │
│         ▼                        ▼                        ▼              │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                   STATE MANAGEMENT LAYER                          │   │
│  │  ┌──────────────┐  ┌────────────────┐  ┌────────────────────┐   │   │
│  │  │ TanStack Query│  │ Custom Hooks   │  │  Form State        │   │   │
│  │  │ - Caching    │  │  - useApi      │  │  - Validation      │   │   │
│  │  │ - Mutations  │  │  - useCarHire  │  │  - Error Handling  │   │   │
│  │  │ - Prefetch   │  │  - useDebounce │  │  - Submission      │   │   │
│  │  └──────────────┘  └────────────────┘  └────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/JSON
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           API LAYER (Next.js)                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    API Routes (RESTful)                          │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │   │
│  │  │ Public APIs  │  │ Protected    │  │  Upload Endpoints    │   │   │
│  │  │  /api/cars   │  │  /api/auth   │  │  /api/upload         │   │   │
│  │  │  /api/brands │  │  + JWT Auth  │  │  - Images            │   │   │
│  │  │  /api/reviews│  │  Middleware  │  │  - Videos            │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│         │                        │                        │              │
│         ▼                        ▼                        ▼              │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      SERVICE LAYER                                │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │   │
│  │  │ CarService   │  │ UserService  │  │  ReviewService       │   │   │
│  │  │ BrandService │  │ AuthService  │  │  TestimonialService  │   │   │
│  │  │ CategorySvc  │  │ CloudinarySvc│  │  (Business Logic)    │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│         │                        │                        │              │
│         ▼                        ▼                        ▼              │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      DATA ACCESS LAYER                            │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │   │
│  │  │   Mongoose   │  │   MongoDB    │  │   Cloudinary API     │   │   │
│  │  │   Models &   │  │  Connection  │  │   (Media Storage)    │   │   │
│  │  │   Schemas    │  │   Manager    │  │                      │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASE & STORAGE                               │
│  ┌──────────────────────────────────┐  ┌────────────────────────────┐   │
│  │         MongoDB Atlas            │  │   Cloudinary CDN           │   │
│  │  - cars                          │  │   - Images                 │   │
│  │  - brands                        │  │   - Videos                 │   │
│  │  - categories                    │  │   - Optimized Delivery     │   │
│  │  - users                         │  │                            │   │
│  │  - reviews                       │  │                            │   │
│  │  - videotestimonials             │  │                            │   │
│  └──────────────────────────────────┘  └────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## Architecture Layers

### 1. Client Layer

**Technology**: Next.js 15 App Router, React 19, TypeScript

The presentation layer consists of:

#### Public Pages
- **Home Page**: Hero section, featured cars, brands, categories, testimonials
- **Cars Listing**: Filterable car catalog with pagination
- **Car Details**: Individual car page with gallery, specs, reviews
- **Brands Page**: All available luxury car brands
- **Categories Page**: Vehicle categories (Luxury, Sports, SUV, etc.)
- **FAQ Page**: Frequently asked questions

#### Admin Panel
- **Dashboard**: Analytics, statistics, and overview
- **Car Management**: CRUD operations for vehicles
- **Brand Management**: Manage car manufacturers
- **Category Management**: Organize vehicle types
- **Review Moderation**: Approve/reject customer reviews
- **Video Testimonials**: Manage video content
- **Settings**: Application configuration

#### Component Architecture
```
components/
├── admin/                    # Admin-specific components
│   ├── brand-dialog.tsx      # Brand creation/edit dialog
│   ├── car-dialog.tsx        # Car creation/edit dialog
│   ├── category-dialog.tsx   # Category creation/edit dialog
│   └── status-modal.tsx      # Status confirmation modals
├── car/                      # Car-related components
│   ├── CarCard.tsx          # Car preview card
│   ├── CarDetails.tsx       # Detailed car information
│   ├── CarImageGallery.tsx  # Image carousel
│   ├── ReviewSection.tsx    # Review display and form
│   └── ...
├── ui/                      # Reusable UI components (Shadcn)
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── form-error.tsx
│   ├── skeleton.tsx
│   └── ...
└── providers/               # Context providers
    └── ReactQueryProvider.tsx
```

### 2. State Management Layer

#### TanStack Query (React Query)
- **Query Caching**: 5-10 minute stale times for different data types
- **Background Updates**: Automatic data refresh on window focus
- **Optimistic Updates**: Immediate UI updates with rollback
- **Infinite Queries**: Efficient pagination for large datasets
- **Prefetching**: Preload data for better UX

#### Custom Hooks
```typescript
// API Data Fetching
useCars(params?)           // Fetch cars with filters
useBrands(params?)         // Fetch brands
useCategories(params?)     // Fetch categories
useReviews(params?)        // Fetch reviews

// Form Management
useFormValidation()        // Form state and validation
useApiError()             // API error handling
useDebounce()             // Debounced input values
```

### 3. API Layer

**Technology**: Next.js API Routes, JWT Authentication

#### Public Endpoints
```
GET  /api/cars              # List cars
GET  /api/cars/[id]         # Get car details
GET  /api/brands            # List brands
GET  /api/categories        # List categories
GET  /api/reviews           # List reviews
POST /api/reviews           # Submit review
GET  /api/video-testimonials # List testimonials
```

#### Protected Endpoints (Admin)
```
POST   /api/auth/register   # Register admin
POST   /api/auth/login      # Admin login
POST   /api/auth/verify     # Verify token

POST   /api/cars            # Create car
PUT    /api/cars/[id]       # Update car
DELETE /api/cars/[id]       # Delete car

POST   /api/upload          # Upload media
```

#### Authentication Flow
1. Admin logs in with credentials
2. Server validates and issues JWT token
3. Token stored in localStorage/cookie
4. Token sent in Authorization header for protected requests
5. Middleware validates token before processing

### 4. Service Layer

**Technology**: TypeScript, Business Logic Encapsulation

The service layer provides a clean abstraction between API routes and database operations:

```typescript
// Car Service
CarService.getAllCars(filters)
CarService.getCarById(id)
CarService.createCar(data)
CarService.updateCar(id, data)
CarService.deleteCar(id)
CarService.searchCars(query)

// Brand Service
BrandService.getAllBrands(filters)
BrandService.createBrand(data)
BrandService.updateBrand(id, data)

// Review Service
ReviewService.getReviewsByCarId(carId)
ReviewService.createReview(data)
ReviewService.approveReview(id)
ReviewService.getReviewStats(carId)
```

**Benefits**:
- Centralizes business logic
- Reusable across different API routes
- Easier testing and maintenance
- Clear separation of concerns

### 5. Data Access Layer

#### MongoDB + Mongoose

**Models**:
```typescript
// Car Model
interface ICar {
  name: string
  brand: ObjectId | IBrand
  category: ObjectId | ICategory
  description: string
  price: number
  images: string[]
  specs: {
    transmission: string
    fuelType: string
    horsepower: number
    seats: number
    year: number
  }
  featured: boolean
  available: boolean
  createdAt: Date
  updatedAt: Date
}

// Brand Model
interface IBrand {
  name: string
  slug: string
  logo: string
  description?: string
  featured: boolean
  carCount: number
}

// Review Model
interface IReview {
  carId: ObjectId
  userName: string
  userEmail?: string
  rating: number
  title: string
  comment: string
  isApproved: boolean
  isFeatured: boolean
  createdAt: Date
}
```

#### Cloudinary Integration
- **Image Upload**: Optimized image storage with transformations
- **Video Upload**: Video testimonials with thumbnail generation
- **CDN Delivery**: Fast global content delivery
- **Transformations**: Automatic image optimization and resizing

## Database Schema

### Collections

#### 1. `cars`
```javascript
{
  _id: ObjectId,
  name: String,
  brand: ObjectId,  // Reference to brands collection
  category: ObjectId,  // Reference to categories collection
  description: String,
  price: Number,
  images: [String],  // Cloudinary URLs
  specs: {
    transmission: String,
    fuelType: String,
    horsepower: Number,
    seats: Number,
    year: Number
  },
  featured: Boolean,
  available: Boolean,
  viewCount: Number,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ name: "text", brand: "text", description: "text" }  // Full-text search
{ featured: 1, createdAt: -1 }  // Featured cars query
{ brand: 1 }  // Brand filter
{ category: 1 }  // Category filter
```

#### 2. `brands`
```javascript
{
  _id: ObjectId,
  name: String,  // Unique
  slug: String,  // Unique
  logo: String,  // Cloudinary URL
  description: String,
  featured: Boolean,
  carCount: Number,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ name: 1 }  // Unique index
{ slug: 1 }  // Unique index
{ featured: 1 }
```

#### 3. `categories`
```javascript
{
  _id: ObjectId,
  name: String,
  slug: String,
  type: String,  // 'luxury', 'sports', 'suv', 'exotic', 'sedan'
  description: String,
  image: String,
  featured: Boolean,
  carCount: Number,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ name: 1 }
{ slug: 1 }
{ type: 1 }
```

#### 4. `users`
```javascript
{
  _id: ObjectId,
  email: String,  // Unique
  password: String,  // Bcrypt hashed
  name: String,
  role: String,  // 'admin', 'user'
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ email: 1 }  // Unique index
```

#### 5. `reviews`
```javascript
{
  _id: ObjectId,
  carId: ObjectId,  // Reference to cars collection
  userId: ObjectId,  // Optional reference to users
  userName: String,
  userEmail: String,
  rating: Number,  // 1-5
  title: String,
  comment: String,
  isApproved: Boolean,
  isFeatured: Boolean,
  isAdminCreated: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ carId: 1, isApproved: 1, createdAt: -1 }
{ rating: 1 }
{ isFeatured: 1, createdAt: -1 }
```

#### 6. `videotestimonials`
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  videoUrl: String,  // Cloudinary URL
  thumbnailUrl: String,  // Cloudinary URL or extracted frame
  isApproved: Boolean,
  isFeatured: Boolean,
  viewCount: Number,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ isApproved: 1, createdAt: -1 }
{ isFeatured: 1, createdAt: -1 }
```

## Data Flow

### 1. User Views Car Listing

```
User → Next.js Page → useReactQuery Hook → API Route (/api/cars)
  → CarService.getAllCars() → MongoDB Query → Response JSON
  → TanStack Query Cache → UI Update
```

### 2. Admin Creates New Car

```
Admin → Car Dialog Form → useFormValidation → Form Submit
  → Upload Images to Cloudinary → Get URLs
  → API Route POST /api/cars (JWT Auth)
  → CarService.createCar() → MongoDB Insert
  → Success Response → Cache Invalidation → UI Update → Toast
```

### 3. Customer Submits Review

```
Customer → Review Form → POST /api/reviews
  → ReviewService.createReview() → MongoDB Insert (isApproved=false)
  → Admin Notification → Admin Reviews → Approve/Reject
  → PATCH /api/reviews/[id] → Update isApproved
  → Cache Invalidation → Public Display
```

## Security Architecture

### Authentication
- **JWT Tokens**: Secure, stateless authentication
- **Password Hashing**: bcryptjs with salt rounds
- **Token Expiration**: Configurable token lifetime
- **Refresh Tokens**: *(To be implemented)*

### Authorization
- **Role-Based Access**: Admin vs. User roles
- **Protected Routes**: Middleware validation
- **API Security**: Token verification on protected endpoints

### Data Validation
- **Server-Side Validation**: All inputs validated before processing
- **Client-Side Validation**: Immediate user feedback
- **Type Safety**: TypeScript enforces type constraints
- **Sanitization**: XSS prevention, SQL injection protection

### Rate Limiting
- **API Rate Limits**: *(To be implemented)*
- **DDoS Protection**: Cloudflare/Vercel edge protection

## Performance Optimizations

### Frontend
1. **Code Splitting**: Automatic route-based splitting by Next.js
2. **Image Optimization**: Next.js Image component with lazy loading
3. **Caching Strategy**: TanStack Query with smart cache invalidation
4. **Prefetching**: Link prefetching and data prefetching
5. **Bundle Optimization**: Tree shaking, minification

### Backend
1. **Database Indexes**: Optimized queries with proper indexes
2. **Connection Pooling**: MongoDB connection reuse
3. **Query Optimization**: Lean queries, projection, population
4. **CDN**: Cloudinary for media delivery
5. **API Response Caching**: *(To be implemented)*

### Database
1. **Indexes**: Strategic indexes for common queries
2. **Aggregation**: Efficient data aggregation pipelines
3. **Pagination**: Cursor-based pagination for large datasets
4. **Projection**: Return only necessary fields

## Scalability Considerations

### Horizontal Scaling
- **Stateless API**: No server-side session state
- **Load Balancing**: Multiple instances with load balancer
- **Database Sharding**: MongoDB sharding for growth

### Vertical Scaling
- **Database**: Upgrade MongoDB cluster tier
- **API**: Increase server resources
- **CDN**: Cloudinary scales automatically

### Future Enhancements
1. **Microservices**: Split into smaller services if needed
2. **Message Queue**: Redis/RabbitMQ for async processing
3. **Caching Layer**: Redis for API response caching
4. **Search Engine**: Elasticsearch for advanced search
5. **Real-time**: WebSockets for live updates

## Development Workflow

### Local Development
1. Clone repository
2. Install dependencies (`npm install`)
3. Set up environment variables
4. Run development server (`npm run dev`)
5. Make changes and test
6. Build and deploy

### CI/CD Pipeline
1. Push code to GitHub
2. Automated tests run
3. Build verification
4. Deploy to staging
5. Production deployment (manual approval)

## Deployment Architecture

### Vercel Deployment (Recommended)
```
GitHub Repository
  ↓ (Push/Merge)
Vercel Build
  ↓ (Success)
Edge Network Deployment
  ↓
Global CDN Distribution
```

### Database
- **MongoDB Atlas**: Managed MongoDB cluster
- **Backups**: Automated daily backups
- **Monitoring**: Real-time performance monitoring

### Media Storage
- **Cloudinary**: Image and video CDN
- **Transformations**: On-the-fly optimization
- **Backup**: Original files stored

## Monitoring & Logging

### Application Monitoring
- **Vercel Analytics**: Performance monitoring
- **Error Tracking**: Next.js error boundaries
- **Custom Logging**: Server-side logging

### Database Monitoring
- **MongoDB Atlas**: Built-in monitoring
- **Query Performance**: Slow query tracking
- **Connection Pool**: Monitor active connections

### User Analytics
- **Vercel Analytics**: Page views, performance
- **Custom Events**: User interaction tracking

## Disaster Recovery

### Backups
- **Database**: Daily automated backups
- **Code**: Git version control
- **Media**: Cloudinary backup

### Recovery Plan
1. Restore database from latest backup
2. Deploy previous stable version
3. Verify system functionality
4. Investigate and fix root cause

---

**Last Updated**: January 2025
**Document Version**: 1.0

