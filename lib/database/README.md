# Database Setup Guide

## Supabase Database Schema Setup

### Steps:

1. **Go to Supabase SQL Editor**
   - Open your Supabase project: https://supabase.com/dashboard/project/cpmjyxecvkyfzdwsscck
   - Navigate to SQL Editor

2. **Run the Schema**
   - Copy the contents of `schema.sql`
   - Paste into SQL Editor
   - Click "Run" to execute

3. **Verify Tables**
   - Go to Table Editor
   - You should see these tables:
     - profiles
     - companies
     - bank_accounts
     - machines
     - proforma_invoices
     - shipments
     - expenses
     - payments
     - financial_summaries

## Database Structure

### Core Tables:

**machines** - Heavy machinery inventory
- Tracks brand, model, chassis number, status
- Purchase information and supplier details
- Current location and condition

**proforma_invoices** - Sales invoices
- Links to machine and customer
- Pricing and currency
- Delivery and payment terms
- Bank account information

**shipments** - Logistics tracking
- Port-to-port shipping details
- Container and shipping company info
- Status tracking from loading to delivery

**expenses** - Cost tracking
- All costs associated with transactions
- Categorized expenses (transport, customs, etc.)
- Invoice and payment tracking

**payments** - Revenue tracking
- Customer payments
- Deposit tracking
- Payment methods and references

**companies** - Customers and suppliers
- Contact information
- Business details

**bank_accounts** - Payment destinations
- Multiple currency support
- Bank details for invoices

**financial_summaries** - Reporting
- Automatic profit/loss calculations
- Monthly and yearly aggregations

## Security

- Row Level Security (RLS) enabled on all tables
- Authenticated users can access all data
- Profile updates restricted to own profile
- Can be customized for role-based access

## Indexes

Performance indexes created for:
- Machine status and chassis number
- Invoice customer and status
- Shipment status
- Expense and payment lookups
