# Architectural Decision Records (ADR)

This document records the key architectural decisions made during the development of ESrent.ae, including the context, decision, and consequences of each choice.

---

## ADR-001: Next.js 15 with App Router

**Date**: 2024-12-01  
**Status**: Accepted  
**Deciders**: Development Team

### Context
We needed to choose a React framework for building a modern, performant luxury car rental platform with both public-facing pages and an admin panel.

### Decision
Adopt **Next.js 15 with the App Router** as the primary framework.

### Alternatives Considered
1. **Create React App (CRA)**: Simple but lacks SSR, routing, and modern features
2. **Vite + React Router**: Fast dev server but requires manual SSR setup
3. **Remix**: Great DX but smaller ecosystem and newer framework
4. **Next.js Pages Router**: Stable but older pattern, migration path to App Router

### Consequences

**Positive:**
- Server and client components for optimal performance
- Built-in routing with file-system based structure
- API routes for backend functionality
- Automatic code splitting and optimization
- Image optimization out of the box
- SEO-friendly with SSR/SSG capabilities
- Large ecosystem and community support
- Vercel deployment integration

**Negative:**
- Learning curve for App Router (newer paradigm)
- Server vs client component boundaries require careful consideration
- Some third-party libraries may have compatibility issues

---

## ADR-002: MongoDB over PostgreSQL

**Date**: 2024-12-01  
**Status**: Accepted  
**Deciders**: Development Team

### Context
We needed to choose a database for storing cars, brands, categories, reviews, and user data. The data model is document-oriented with nested structures and flexible schemas.

### Decision
Use **MongoDB** with **Mongoose** ODM.

### Alternatives Considered
1. **PostgreSQL**: Robust SQL database with strong consistency
2. **MySQL**: Popular SQL database
3. **Firebase Firestore**: Managed NoSQL solution
4. **Supabase**: Open-source Firebase alternative

### Consequences

**Positive:**
- Flexible schema perfect for evolving requirements
- Excellent for nested data (car specs, reviews)
- Fast read performance for catalog browsing
- Easy to scale horizontally
- JSON-like documents match JavaScript/TypeScript naturally
- MongoDB Atlas provides managed hosting
- Mongoose provides strong TypeScript support

**Negative:**
- No foreign key constraints (must be handled in application)
- Complex transactions require careful design
- Query optimization requires understanding of indexes
- Potential for data duplication

---

## ADR-003: TanStack Query (React Query) for State Management

**Date**: 2024-12-20  
**Status**: Accepted  
**Deciders**: Development Team

### Context
Initially used custom hooks for API data fetching, but needed better caching, background updates, and optimistic UI updates.

### Decision
Migrate to **TanStack Query (React Query)** for server state management.

### Alternatives Considered
1. **Redux + RTK Query**: More boilerplate, heavier setup
2. **SWR**: Similar to React Query but less feature-rich
3. **Apollo Client**: Overkill without GraphQL
4. **Custom hooks**: Already implemented but lacking advanced features

### Consequences

**Positive:**
- Automatic caching and cache invalidation
- Background data synchronization
- Optimistic updates with automatic rollback
- Window focus refetching
- Request deduplication
- Pagination and infinite scrolling support
- DevTools for debugging
- Significantly improved perceived performance

**Negative:**
- Additional dependency (though lightweight)
- Learning curve for query keys and cache management
- Migration effort from existing hooks

---

## ADR-004: JWT Authentication for Admin Panel

**Date**: 2024-12-10  
**Status**: Accepted  
**Deciders**: Development Team

### Context
Admin panel requires secure authentication to protect CRUD operations and sensitive data.

### Decision
Implement **JWT (JSON Web Token)** based authentication with **bcryptjs** for password hashing.

### Alternatives Considered
1. **Session-based auth**: Server-side sessions with cookies
2. **OAuth 2.0**: Third-party authentication
3. **Firebase Auth**: Managed authentication service
4. **NextAuth.js**: Authentication library for Next.js

### Consequences

**Positive:**
- Stateless authentication (no server-side session storage)
- Works well with API routes
- Scales horizontally easily
- Token can include user metadata
- Simple implementation with jsonwebtoken library
- Works across different domains/subdomains

**Negative:**
- Cannot revoke tokens before expiration (requires blacklist)
- Token size larger than session ID
- Must securely store JWT secret
- Refresh token strategy needed for long-lived sessions

**Future Enhancement**: Implement refresh tokens for better security.

---

## ADR-005: Cloudinary for Media Storage

**Date**: 2024-12-01  
**Status**: Accepted  
**Deciders**: Development Team

### Context
Need to store and deliver car images, brand logos, and video testimonials efficiently with optimization.

### Decision
Use **Cloudinary** for image and video storage, transformation, and CDN delivery.

### Alternatives Considered
1. **AWS S3 + CloudFront**: More control but requires manual setup
2. **Vercel Blob Storage**: Simple but newer and less feature-rich
3. **Self-hosted**: Full control but high maintenance
4. **Firebase Storage**: Managed but limited transformations

### Consequences

**Positive:**
- Automatic image optimization and transformation
- Global CDN for fast delivery
- On-the-fly image resizing and format conversion
- Video thumbnail generation
- Generous free tier
- Simple upload API
- Built-in analytics

**Negative:**
- Vendor lock-in
- Costs can increase with high usage
- Migration would require re-uploading all media
- Limited control over CDN configuration

---

## ADR-006: Tiptap for Rich Text Editing

**Date**: 2024-12-28  
**Status**: Accepted  
**Deciders**: Development Team

### Context
Car descriptions need rich formatting (bold, italic, lists, links) for better presentation.

### Decision
Integrate **Tiptap** editor for rich text descriptions in admin car management.

### Alternatives Considered
1. **Draft.js**: React-based but older and less maintained
2. **Quill**: Popular but heavier bundle size
3. **Slate**: Powerful but complex API
4. **TinyMCE**: Feature-rich but not React-first
5. **Plain textarea**: Simple but no formatting

### Consequences

**Positive:**
- Modern, extensible editor framework
- Headless architecture (custom UI possible)
- Great TypeScript support
- Modular extensions (only include what you need)
- ProseMirror-based (battle-tested foundation)
- React-first design
- Active development and community

**Negative:**
- Additional bundle size
- Learning curve for ProseMirror concepts
- Some advanced features require premium extensions
- State management can be tricky with React

---

## ADR-007: Comprehensive Error Handling System

**Date**: 2025-01-03  
**Status**: Accepted  
**Deciders**: Development Team

### Context
Admin forms lacked proper validation and error feedback, leading to poor UX and potential data issues.

### Decision
Implement a comprehensive error handling system with:
- `useFormValidation` hook for form state and validation
- `useApiError` hook for API error processing
- Reusable error display components
- Common validation rules
- File upload validation

### Alternatives Considered
1. **React Hook Form**: Popular library but added dependency
2. **Formik**: Established but heavier and older API
3. **Basic state + validation**: Already had this, needed improvement
4. **No formal system**: Inconsistent error handling

### Consequences

**Positive:**
- Consistent error handling across all admin forms
- Reusable validation rules
- Better user experience with clear error messages
- Centralized logic reduces code duplication
- Type-safe with TypeScript
- Easy to extend with new validation rules
- Automatic error clearing on field changes

**Negative:**
- Custom implementation requires maintenance
- Not as feature-rich as established libraries
- Team needs to learn custom API

---

## ADR-008: Shadcn/ui for UI Components

**Date**: 2024-12-01  
**Status**: Accepted  
**Deciders**: Development Team

### Context
Need a component library that's customizable, accessible, and doesn't bloat the bundle.

### Decision
Use **Shadcn/ui** - a collection of re-usable components built with Radix UI and Tailwind CSS.

### Alternatives Considered
1. **Material-UI (MUI)**: Feature-rich but heavy bundle, opinionated design
2. **Chakra UI**: Good DX but larger bundle, different styling approach
3. **Ant Design**: Enterprise-focused, not suitable for luxury brand aesthetic
4. **Headless UI**: More flexible but requires more custom styling
5. **Custom components**: Full control but high development time

### Consequences

**Positive:**
- Copy-paste components into project (no runtime dependency)
- Full customization with Tailwind CSS
- Accessible components built on Radix UI
- Modern, clean design
- TypeScript support
- Active community and regular updates
- Small bundle size (only include what you use)
- Easy to theme and customize

**Negative:**
- Manual updates (no npm package to upgrade)
- Need to copy each component individually
- Requires Tailwind CSS understanding
- Not a traditional component library

---

## ADR-009: Individual Section Loading States

**Date**: 2025-01-08  
**Status**: Accepted  
**Deciders**: Development Team

### Context
Home page used a single skeleton loader that blocked all sections, causing poor perceived performance.

### Decision
Implement **individual loading states** for each major section (Featured Brands, Featured Vehicles, Categories, Testimonials).

### Alternatives Considered
1. **Single skeleton**: Simple but poor UX (existing implementation)
2. **Lazy loading**: Better but still sequential
3. **Suspense boundaries**: Modern but requires more refactoring
4. **No loading states**: Bad UX with blank page

### Consequences

**Positive:**
- Sections load independently
- Perceived performance improvement
- Better user experience (content appears faster)
- Failed requests don't block entire page
- More granular error handling

**Negative:**
- Slightly more complex state management
- Multiple concurrent API requests
- More components to maintain

---

## ADR-010: Cursor-Based Pagination

**Date**: 2024-12-22  
**Status**: Accepted (for specific use cases)  
**Deciders**: Development Team

### Context
Offset-based pagination (`skip/limit`) has performance issues with large datasets and can show duplicate/missing items when data changes.

### Decision
Implement **cursor-based pagination** alongside offset pagination for infinite scroll and large datasets.

### Alternatives Considered
1. **Offset pagination only**: Simple but performance degrades with high page numbers
2. **Cursor only**: Better performance but harder to implement "jump to page"
3. **Hybrid approach**: Use cursor for infinite scroll, offset for numbered pages

### Consequences

**Positive:**
- Consistent performance regardless of position in dataset
- No duplicate or missing items during pagination
- Better for real-time data
- Efficient database queries
- Works well with TanStack Query infinite queries

**Negative:**
- Cannot jump to arbitrary page numbers
- More complex implementation
- Requires understanding of cursor mechanics
- Not suitable for all use cases

---

## Future Decisions to Document

- Payment gateway integration (Stripe vs. others)
- Email service provider (SendGrid, AWS SES, etc.)
- Search implementation (Algolia vs. Elasticsearch)
- Real-time features (WebSockets vs. Server-Sent Events)
- Internationalization approach (next-intl vs. i18next)
- Mobile app strategy (React Native vs. PWA)
- Analytics platform (Google Analytics vs. Mixpanel)

---

## Decision Making Process

1. **Identify the Problem**: Clearly define what needs to be decided
2. **Research Options**: List all viable alternatives
3. **Evaluate Tradeoffs**: Consider pros/cons, costs, and long-term implications
4. **Make Decision**: Choose the best option based on project requirements
5. **Document**: Record the decision in this ADR
6. **Review**: Revisit decisions periodically as project evolves

---

**Last Updated**: January 2025  
**Total ADRs**: 10

For questions about these decisions, contact the development team.

