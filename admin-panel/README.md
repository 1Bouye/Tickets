# Admin Panel - Ticket Management System

A Next.js-based admin panel for managing a daily ticket management system.

## Features

- **Dashboard**: Overview of today's ticket statistics and system activity
- **User Management**: Create, view, edit, and deactivate user accounts
- **Ticket Generation**: Generate daily batches of tickets
- **Ticket Management**: View, filter, and search tickets
- **Reports**: Historical data and statistics visualization

## Tech Stack

- Next.js 16+ (App Router)
- React 19+
- TypeScript
- Tailwind CSS
- Axios for API calls
- React Hook Form + Zod for form validation
- Lucide React for icons

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running (see backend documentation)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=Ticket Management System
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
admin-panel/
├── app/                    # Next.js app router pages
│   ├── dashboard/         # Dashboard page
│   ├── login/             # Login page
│   ├── users/             # User management page
│   ├── tickets/           # Ticket pages
│   │   ├── generate/      # Ticket generation
│   │   └── page.tsx       # Ticket management
│   └── reports/           # Reports page
├── components/            # React components
│   ├── layout/           # Layout components
│   └── ui/               # Reusable UI components
├── context/              # React context providers
├── lib/                  # Utilities and services
│   ├── api.ts           # Axios configuration
│   └── services/        # API service functions
└── public/              # Static assets
```

## Authentication

The app uses JWT token-based authentication. Tokens are stored in localStorage and automatically included in API requests.

## API Integration

All API calls are made through service functions in `lib/services/`. The base API URL is configured in `.env.local`.

## Development

- Run `npm run dev` for development
- Run `npm run build` for production build
- Run `npm start` to start production server

## Notes

- Make sure the backend API is running before starting the frontend
- All protected routes require authentication
- The app automatically redirects to login if not authenticated
