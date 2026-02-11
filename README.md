# BARcode Client (React/Next.js)

Modern React-based frontend for the BARcode application.

## Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **UI Library**: shadcn/ui (Radix UI + Tailwind CSS)
- **State Management**: 
  - TanStack Query (React Query) for server state
  - Zustand for client state (if needed)
- **Forms**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 20+
- Running backend server on port 3003
- Running web server on port 8080 (for uploads)

### Installation

```bash
cd client
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Building

```bash
npm run build
npm run start
```

## Project Structure

```
client/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page
│   └── collection/        # Collection pages
├── components/
│   └── ui/                # shadcn/ui components
├── hooks/                 # Custom React hooks
│   ├── use-collection.ts
│   ├── use-frag.ts
│   └── use-user.ts
├── lib/                   # Utilities
│   ├── api.ts            # Axios client
│   ├── cn.ts             # Class name utility
│   └── utils.ts          # General utilities
├── providers/             # React context providers
│   └── query-provider.tsx
├── types/                 # TypeScript type definitions
│   └── index.ts
└── public/               # Static assets
```

## API Integration

The app connects to the existing Node.js backend through Next.js API routes proxy:

- API requests to `/api/*` are proxied to `http://localhost:3003/api/*`
- Upload requests to `/bc/uploads/*` are proxied to `http://localhost:8080/bc/uploads/*`

## Features Implemented

- ✅ Modern design with Tailwind CSS
- ✅ React Query for data fetching
- ✅ TypeScript throughout
- ✅ Collection view with filtering
- ✅ Gallery and card view modes
- ✅ Responsive design
- ✅ Dark mode ready

## Features In Progress

- 🔄 Frag detail page
- 🔄 Equipment management
- 🔄 Tank management
- 🔄 Marketplace
- 🔄 Member directory
- 🔄 Admin panel

## Migration from Vue

This is a complete rewrite of the original Vue/Nuxt application. Key differences:

- Vue → React
- Vuetify → shadcn/ui + Tailwind
- Options API → Hooks
- Vuex → React Query + Zustand
- Nuxt 2 → Next.js 14+

The backend API remains the same, so both apps can run side-by-side during migration.
