-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE machine_status AS ENUM ('available', 'reserved', 'in_transit', 'sold');
CREATE TYPE shipment_status AS ENUM ('pending', 'loading', 'in_transit', 'arrived', 'delivered');
CREATE TYPE payment_status AS ENUM ('pending', 'partial', 'paid');
CREATE TYPE currency_type AS ENUM ('USD', 'EUR', 'TRY');
CREATE TYPE expense_category AS ENUM ('transport', 'customs', 'port_fees', 'insurance', 'inspection', 'storage', 'other');

-- Users/Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies (Customers and Suppliers)
CREATE TABLE companies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'customer' or 'supplier'
  country TEXT,
  address TEXT,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  tax_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bank Accounts
CREATE TABLE bank_accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  bank_name TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  account_number TEXT NOT NULL,
  iban TEXT,
  swift_code TEXT,
  currency currency_type NOT NULL DEFAULT 'USD',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Machines
CREATE TABLE machines (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  machine_type TEXT NOT NULL,
  chassis_number TEXT UNIQUE NOT NULL,
  year INTEGER,
  hours_used INTEGER,
  status machine_status DEFAULT 'available',
  purchase_price DECIMAL(15, 2),
  purchase_currency currency_type DEFAULT 'USD',
  supplier_id UUID REFERENCES companies(id),
  purchase_date DATE,
  location TEXT,
  notes TEXT,
  images TEXT[], -- Array of image URLs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Proforma Invoices
CREATE TABLE proforma_invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES companies(id),

  -- Machine details (copied from machine at time of invoice)
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  machine_type TEXT NOT NULL,
  chassis_number TEXT NOT NULL,

  -- Pricing
  unit_price DECIMAL(15, 2) NOT NULL,
  currency currency_type NOT NULL DEFAULT 'USD',

  -- Delivery terms
  delivery_terms TEXT, -- FOB, CIF, etc.
  loading_port TEXT,
  destination_port TEXT,

  -- Payment terms
  payment_terms TEXT,
  deposit_amount DECIMAL(15, 2),
  deposit_paid BOOLEAN DEFAULT FALSE,
  deposit_date DATE,

  -- Bank details
  bank_account_id UUID REFERENCES bank_accounts(id),

  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  validity_date DATE,

  status payment_status DEFAULT 'pending',
  notes TEXT,

  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shipments
CREATE TABLE shipments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  proforma_invoice_id UUID REFERENCES proforma_invoices(id) ON DELETE CASCADE,
  machine_id UUID REFERENCES machines(id),

  -- Shipping details
  loading_port TEXT NOT NULL,
  destination_port TEXT NOT NULL,
  shipping_company TEXT,
  container_number TEXT,
  bill_of_lading TEXT,

  -- Dates
  loading_date DATE,
  departure_date DATE,
  estimated_arrival_date DATE,
  actual_arrival_date DATE,
  delivery_date DATE,

  status shipment_status DEFAULT 'pending',
  current_location TEXT,

  -- Costs
  shipping_cost DECIMAL(15, 2),
  shipping_currency currency_type DEFAULT 'USD',

  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses
CREATE TABLE expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  proforma_invoice_id UUID REFERENCES proforma_invoices(id),
  shipment_id UUID REFERENCES shipments(id),
  category expense_category NOT NULL,

  description TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency currency_type NOT NULL DEFAULT 'USD',

  invoice_number TEXT,
  invoice_date DATE,
  paid BOOLEAN DEFAULT FALSE,
  payment_date DATE,

  notes TEXT,
  attachments TEXT[], -- Array of file URLs

  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments (incoming from customers)
CREATE TABLE payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  proforma_invoice_id UUID REFERENCES proforma_invoices(id) ON DELETE CASCADE,

  amount DECIMAL(15, 2) NOT NULL,
  currency currency_type NOT NULL DEFAULT 'USD',

  payment_date DATE NOT NULL,
  payment_method TEXT, -- 'bank_transfer', 'cash', etc.
  reference_number TEXT,

  is_deposit BOOLEAN DEFAULT FALSE,

  notes TEXT,

  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial Summary (for reporting)
CREATE TABLE financial_summaries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  proforma_invoice_id UUID REFERENCES proforma_invoices(id) ON DELETE CASCADE,

  -- Revenue
  total_revenue DECIMAL(15, 2) DEFAULT 0,
  revenue_currency currency_type DEFAULT 'USD',

  -- Costs
  purchase_cost DECIMAL(15, 2) DEFAULT 0,
  total_expenses DECIMAL(15, 2) DEFAULT 0,

  -- Profit
  gross_profit DECIMAL(15, 2) GENERATED ALWAYS AS (total_revenue - purchase_cost - total_expenses) STORED,
  profit_margin DECIMAL(5, 2),

  -- Payments
  total_paid DECIMAL(15, 2) DEFAULT 0,
  balance_due DECIMAL(15, 2) GENERATED ALWAYS AS (total_revenue - total_paid) STORED,

  year INTEGER,
  month INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_machines_status ON machines(status);
CREATE INDEX idx_machines_chassis ON machines(chassis_number);
CREATE INDEX idx_proforma_invoices_customer ON proforma_invoices(customer_id);
CREATE INDEX idx_proforma_invoices_status ON proforma_invoices(status);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_expenses_invoice ON expenses(proforma_invoice_id);
CREATE INDEX idx_payments_invoice ON payments(proforma_invoice_id);

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE proforma_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_summaries ENABLE ROW LEVEL SECURITY;

-- Policies (authenticated users can read/write all data)
-- You can make these more restrictive based on roles

CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view companies" ON companies FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage companies" ON companies FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view bank accounts" ON bank_accounts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage bank accounts" ON bank_accounts FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view machines" ON machines FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage machines" ON machines FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view invoices" ON proforma_invoices FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage invoices" ON proforma_invoices FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view shipments" ON shipments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage shipments" ON shipments FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view expenses" ON expenses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage expenses" ON expenses FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view payments" ON payments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage payments" ON payments FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view summaries" ON financial_summaries FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage summaries" ON financial_summaries FOR ALL USING (auth.role() = 'authenticated');

-- Functions and Triggers

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_machines_updated_at BEFORE UPDATE ON machines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proforma_invoices_updated_at BEFORE UPDATE ON proforma_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_summaries_updated_at BEFORE UPDATE ON financial_summaries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
