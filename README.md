# ESrent.ae - Luxury Car Rental Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.1.0-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.17.0-green)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.1-38bdf8)](https://tailwindcss.com/)

A modern, full-stack luxury car rental platform built for the UAE market, featuring a sophisticated admin panel, real-time search, and an elegant user experience.

## 🚀 Features

### Customer-Facing Features
- **🏎️ Luxury Car Catalog**: Browse premium vehicles from top brands (Ferrari, Lamborghini, Rolls-Royce, etc.)
- **🔍 Advanced Search**: Real-time search with filters for brand, category, price range, and specifications
- **⭐ Review System**: Customer reviews and ratings with admin moderation
- **📱 Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **🎥 Video Testimonials**: Interactive video carousel showcasing customer experiences
- **💳 Dynamic Pricing**: Transparent pricing with customizable rental periods
- **🏷️ Categories**: Luxury, Sports, SUV, Exotic, and more

### Admin Panel Features
- **📊 Dashboard**: Comprehensive analytics and statistics
- **🚗 Car Management**: Full CRUD operations for vehicles with image uploads
- **🏢 Brand Management**: Manage car brands with logos and descriptions
- **📂 Category Management**: Organize vehicles by type and features
- **✅ Review Moderation**: Approve, reject, and feature customer reviews
- **🎬 Video Testimonials**: Manage customer video testimonials
- **🔐 Authentication**: Secure JWT-based admin authentication
- **📸 Media Management**: Cloudinary integration for image/video uploads

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15.1.0](https://nextjs.org/) (App Router)
- **UI Library**: [React 19.0.0](https://reactjs.org/)
- **Language**: [TypeScript 5.x](https://www.typescriptlang.org/)
- **Styling**: [TailwindCSS 3.4.1](https://tailwindcss.com/) + [Shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [TanStack Query (React Query) 5.85.9](https://tanstack.com/query/latest)
- **Rich Text Editor**: [Tiptap 3.0.7](https://tiptap.dev/)
- **Animations**: [Framer Motion 12.23.0](https://www.framer.com/motion/)
- **Carousel**: [Embla Carousel 8.6.0](https://www.embla-carousel.com/)
- **Icons**: [Lucide React 0.468.0](https://lucide.dev/)

### Backend
- **Database**: [MongoDB 6.17.0](https://www.mongodb.com/) with [Mongoose 8.16.3](https://mongoosejs.com/)
- **Authentication**: [JWT (jsonwebtoken 9.0.2)](https://jwt.io/) + [bcryptjs 3.0.2](https://github.com/dcodeIO/bcrypt.js)
- **File Upload**: [Cloudinary 2.7.0](https://cloudinary.com/)
- **Search**: [Algolia 4.22.1](https://www.algolia.com/) *(optional)*
- **API**: Next.js API Routes (RESTful)

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint 9
- **Type Checking**: TypeScript 5.x
- **CSS Processing**: PostCSS 8

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **MongoDB**: Local instance or MongoDB Atlas account
- **Cloudinary Account**: For media management

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ESrent.ae.git
cd ESrent.ae
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file and configure it:

```bash
cp env.example .env.local
```

Edit `.env.local` with your configuration (see [.env.example](.env.example) for details).

### 4. Set Up MongoDB

**Option A: MongoDB Atlas (Recommended)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env.local`

**Option B: Local MongoDB**
```bash
# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Create Admin Account

To access the admin panel, you need to create an admin account:

```bash
# Use the registration endpoint
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@esrent.ae","password":"yourpassword","name":"Admin"}'
```

Then log in at [http://localhost:3000/admin/login](http://localhost:3000/admin/login).

## 📁 Project Structure

```
ESrent.ae/
├── public/                    # Static assets
│   ├── fonts/                # Custom fonts
│   ├── icons/                # Icon images
│   ├── images/               # Static images
│   └── videos/               # Video assets
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (admin)/         # Admin routes (protected)
│   │   │   └── admin/       # Admin panel pages
│   │   ├── (root)/          # Public routes
│   │   ├── api/             # API routes
│   │   │   ├── auth/        # Authentication endpoints
│   │   │   ├── brands/      # Brand CRUD endpoints
│   │   │   ├── cars/        # Car CRUD endpoints
│   │   │   ├── categories/  # Category CRUD endpoints
│   │   │   ├── reviews/     # Review endpoints
│   │   │   ├── video-testimonials/  # Video testimonial endpoints
│   │   │   └── upload/      # File upload endpoint
│   │   ├── globals.css      # Global styles
│   │   └── layout.tsx       # Root layout
│   ├── components/          # React components
│   │   ├── admin/          # Admin-specific components
│   │   ├── car/            # Car-related components
│   │   ├── demo/           # Demo/example components
│   │   ├── providers/      # Context providers
│   │   └── ui/             # Reusable UI components (Shadcn)
│   ├── hooks/              # Custom React hooks
│   │   ├── useApi.ts       # API data fetching hooks
│   │   ├── useReactQuery.ts # React Query hooks
│   │   ├── useFormValidation.ts # Form validation hook
│   │   └── useApiError.ts   # API error handling hook
│   ├── lib/                # Library code
│   │   ├── models/         # MongoDB/Mongoose models
│   │   ├── services/       # Service layer (business logic)
│   │   ├── middleware/     # Express-like middleware
│   │   ├── utils.ts        # Utility functions
│   │   └── mongodb.ts      # MongoDB connection
│   └── types/              # TypeScript type definitions
├── .env.example            # Environment variable template
├── .env.local              # Local environment variables (create this)
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Project dependencies
```

## 📖 Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)**: System architecture and design patterns
- **[API.md](API.md)**: Complete API documentation
- **[CHANGELOG.md](CHANGELOG.md)**: Version history and changes
- **[ADR.md](ADR.md)**: Architectural Decision Records
- **Database Schema**: See [ARCHITECTURE.md](ARCHITECTURE.md#database-schema)

## 🔑 Environment Variables

See [.env.example](.env.example) for all required environment variables.

Key variables:
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `CLOUDINARY_*`: Cloudinary credentials for media uploads
- `NEXT_PUBLIC_APP_URL`: Application URL

## 🧪 Testing

```bash
# Run linter
npm run lint

# Build for production (includes type checking)
npm run build
```

## 📦 Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. Import project to [Vercel](https://vercel.com/)
3. Configure environment variables
4. Deploy

### Railway

1. Push your code to GitHub
2. Create new project on [Railway](https://railway.app/)
3. Add MongoDB database
4. Configure environment variables
5. Deploy

### Docker

```bash
# Build Docker image
docker build -t esrent-ae .

# Run container
docker run -p 3000:3000 --env-file .env.local esrent-ae
```

## 🔧 Configuration

### Cloudinary Setup

1. Create account at [Cloudinary](https://cloudinary.com/)
2. Get your cloud name, API key, and API secret
3. Add to `.env.local`

### MongoDB Indexes

The application automatically creates required indexes on startup. For production, manually create indexes:

```javascript
// Cars collection
db.cars.createIndex({ name: "text", brand: "text", description: "text" })
db.cars.createIndex({ featured: 1, createdAt: -1 })
db.cars.createIndex({ brand: 1 })
db.cars.createIndex({ category: 1 })

// Brands collection
db.brands.createIndex({ name: 1 }, { unique: true })
db.brands.createIndex({ slug: 1 }, { unique: true })

// Reviews collection
db.reviews.createIndex({ carId: 1, isApproved: 1, createdAt: -1 })
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is proprietary and confidential.

## 👥 Authors

- **ESrent.ae Team**

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Shadcn/ui](https://ui.shadcn.com/) - UI component library
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Cloudinary](https://cloudinary.com/) - Media management

## 📞 Support

For support, email support@esrent.ae or open an issue on GitHub.

## 🔗 Links

- **Website**: [https://esrent.ae](https://esrent.ae)
- **Documentation**: [GitHub Docs](https://github.com/yourusername/ESrent.ae/wiki)
- **Bug Reports**: [GitHub Issues](https://github.com/yourusername/ESrent.ae/issues)

---

Made with ❤️ in Dubai, UAE

