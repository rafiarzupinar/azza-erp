# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AZZA is an ERP system for heavy machinery import/export business built with Next.js 16, TypeScript, and Supabase. The system tracks the complete lifecycle: purchasing machinery in Saudi Arabia, creating proforma invoices, shipping, expense tracking, and profit/loss calculations.

## Development Commands

### Running the Development Server
```bash
npm run dev
```
Runs on http://localhost:3001 (not 3000 - port conflict noted in PROJECT_STATUS.md)

### Build & Production
```bash
npm run build    # Production build
npm start        # Production server
npm run lint     # ESLint check
```

### Database Setup (Already Done!)
The database has been set up via Supabase MCP with sample data including:
- 4 companies (2 customers, 2 suppliers)
- 3 bank accounts (TRY, USD, EUR)
- 5 machines (Caterpillar, Komatsu, Volvo, JCB, Hitachi)
- 3 proforma invoices
- 2 active shipments
- 5 expenses tracked
- 3 payment records

## Architecture

### Supabase Client Pattern

The codebase uses **three distinct Supabase clients** for different contexts:

1. **Browser Client** (`lib/supabase/client.ts`)
   - Use in Client Components (with `"use client"`)
   - Created via `createClient()` from `@/lib/supabase/client`

2. **Server Client** (`lib/supabase/server.ts`)
   - Use in Server Components, Server Actions, Route Handlers
   - Created via `createClient()` from `@/lib/supabase/server`
   - Handles cookie-based authentication with Next.js

3. **Middleware Client** (`lib/supabase/middleware.ts`)
   - Used only in `middleware.ts`
   - Refreshes user sessions on every request
   - Routes protected by checking session existence

**Critical**: Always import the correct client for the context. Using browser client in server components will cause authentication failures.

### Authentication Flow

- **Supabase Auth** with email/password
- **Row Level Security (RLS)** enabled on all database tables
- **Middleware** (`middleware.ts`) protects routes except `/login` and static assets
- Auth state managed via secure httpOnly cookies
- User redirected to `/login` if unauthenticated, to `/dashboard` if authenticated

### Database Relationships

Core entity flow:
```
machines → proforma_invoices (1:N)
companies → proforma_invoices (1:N)
proforma_invoices → shipments (1:N)
proforma_invoices → expenses (1:N)
proforma_invoices → payments (1:N)
proforma_invoices → financial_summaries (1:1)
```

All TypeScript types defined in `types/database.ts` - use these types for all database operations.

### Path Aliases

TypeScript configured with `@/*` alias pointing to project root:
```typescript
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
```

### Component Library

**shadcn/ui** configured in `components.json`:
- Style: default
- Base color: slate
- CSS variables enabled
- Components in `components/ui/`
- Add new components: `npx shadcn@latest add [component-name]`

## Known Issues & Warnings

1. **Next.js 16 Middleware Warning**: Deprecation warning about "proxy" - planned migration noted in PROJECT_STATUS.md
2. **Port 3001**: Default port changed from 3000 due to conflict
3. **React 19**: Using experimental React 19 - some third-party components may show warnings

## Business Domain Context

The system models this workflow:
1. **Purchase**: Buy machinery in Saudi Arabia, pay deposit, record in `machines` table
2. **Proforma Invoice**: Create invoice for customer with pricing, delivery terms, bank details
3. **Shipment**: Track loading port → destination port, container info, status updates
4. **Expenses**: Record all costs (transport, customs, port fees, insurance, etc.)
5. **Payments**: Track customer payments (deposit, balance)
6. **Financial Summary**: Auto-calculate profit/loss (revenue - purchase cost - expenses)

### Important Status Enums

```typescript
MachineStatus: 'available' | 'reserved' | 'in_transit' | 'sold'
ShipmentStatus: 'pending' | 'loading' | 'in_transit' | 'arrived' | 'delivered'
PaymentStatus: 'pending' | 'partial' | 'paid'
CurrencyType: 'USD' | 'EUR' | 'TRY'
ExpenseCategory: 'transport' | 'customs' | 'port_fees' | 'insurance' | 'inspection' | 'storage' | 'other'
```

## Development Patterns

### Data Fetching in Server Components

```typescript
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const { data: machines } = await supabase
    .from('machines')
    .select('*')

  return <MachineList machines={machines} />
}
```

### Data Mutations (Server Actions)

```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createMachine(formData: CreateMachine) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('machines')
    .insert(formData)
    .select()

  if (!error) {
    revalidatePath('/dashboard/machines')
  }
  return { data, error }
}
```

### Client-Side Data Operations

```typescript
'use client'
import { createClient } from '@/lib/supabase/client'

export function MachineForm() {
  const supabase = createClient()

  async function handleSubmit(data: CreateMachine) {
    const { error } = await supabase
      .from('machines')
      .insert(data)
    // ...
  }
}
```

## File Organization

```
app/
├── auth/              # Supabase auth callbacks
├── dashboard/         # Main app (protected routes)
│   ├── layout.tsx     # Dashboard shell with sidebar
│   ├── page.tsx       # Dashboard home (stats, charts)
│   ├── machines/      # Machine management module
│   ├── invoices/      # Proforma invoice module
│   ├── shipments/     # Shipment tracking module
│   └── expenses/      # Expense management module
├── login/             # Public login/signup page
├── layout.tsx         # Root layout with global providers
└── globals.css        # Global styles + Tailwind

components/
├── ui/                # shadcn/ui components (auto-generated)
├── app-sidebar.tsx    # Main navigation sidebar
└── site-header.tsx    # Top header component

lib/
├── database/
│   ├── schema.sql     # Complete PostgreSQL schema
│   └── README.md      # Database setup instructions
├── supabase/
│   ├── client.ts      # Browser Supabase client
│   ├── server.ts      # Server Supabase client
│   └── middleware.ts  # Middleware Supabase client
└── utils.ts           # cn() utility for className merging

types/
└── database.ts        # All TypeScript interfaces for database tables
```

## Deployment Notes

- **Vercel recommended** for deployment (Next.js native platform)
- Environment variables required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Database already initialized with schema and sample data
- RLS policies ensure data security - all queries filtered by authenticated user

## Current Development Status

**Completed**:
- ✅ Authentication with login/signup UI
- ✅ Database schema (all 9 tables created)
- ✅ Sample data populated (machines, invoices, shipments, expenses)
- ✅ Dashboard layout with navigation
- ✅ Supabase MCP integration

**In Progress**: Dashboard UI improvements with real data display

**Planned**:
- Proforma invoice generation with PDF export
- Shipment tracking UI
- Expense management
- Financial reporting

See `PROJECT_STATUS.md` for detailed current status and `README.md` for Turkish documentation.
