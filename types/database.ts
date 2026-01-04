export type MachineStatus = 'available' | 'reserved' | 'in_transit' | 'sold'
export type ShipmentStatus = 'pending' | 'loading' | 'in_transit' | 'arrived' | 'delivered'
export type PaymentStatus = 'pending' | 'partial' | 'paid'
export type CurrencyType = 'USD' | 'EUR' | 'TRY'
export type ExpenseCategory = 'transport' | 'customs' | 'port_fees' | 'insurance' | 'inspection' | 'storage' | 'other'

export interface Profile {
  id: string
  full_name: string
  email: string
  role: string
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  type: 'customer' | 'supplier'
  country?: string
  address?: string
  contact_person?: string
  phone?: string
  email?: string
  tax_number?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface BankAccount {
  id: string
  bank_name: string
  account_holder: string
  account_number: string
  iban?: string
  swift_code?: string
  currency: CurrencyType
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Machine {
  id: string
  brand: string
  model: string
  machine_type: string
  chassis_number: string
  year?: number
  hours_used?: number
  status: MachineStatus
  purchase_price?: number
  purchase_currency: CurrencyType
  supplier_id?: string
  purchase_date?: string
  location?: string
  notes?: string
  images?: string[]
  documents?: string[]
  created_at: string
  updated_at: string
  supplier?: Company
}

export interface ProformaInvoiceItem {
  id: string
  proforma_invoice_id: string
  machine_id: string

  // Machine details
  brand: string
  model: string
  machine_type: string
  chassis_number: string
  year?: number

  // Pricing
  unit_price: number
  quantity: number
  total_price: number

  notes?: string

  created_at: string
  updated_at: string

  // Relations
  machine?: Machine
}

export interface ProformaInvoice {
  id: string
  invoice_number: string
  machine_id?: string
  customer_id: string

  // Machine details (deprecated - now in items)
  brand?: string
  model?: string
  machine_type?: string
  chassis_number?: string

  // Pricing
  unit_price: number
  currency: CurrencyType
  total_amount?: number

  // Delivery terms
  delivery_terms?: string
  loading_port?: string
  destination_port?: string

  // Payment terms
  payment_terms?: string
  deposit_amount?: number
  deposit_paid: boolean
  deposit_date?: string

  // Bank details
  bank_account_id?: string

  issue_date: string
  validity_date?: string

  status: PaymentStatus
  notes?: string

  created_by?: string
  created_at: string
  updated_at: string

  // Relations
  machine?: Machine
  customer?: Company
  bank_account?: BankAccount
  items?: ProformaInvoiceItem[]
  shipments?: Shipment[]
  expenses?: Expense[]
  payments?: Payment[]
}

export interface Shipment {
  id: string
  proforma_invoice_id: string
  machine_id: string

  // Shipping details
  loading_port: string
  destination_port: string
  shipping_company?: string
  container_number?: string
  bill_of_lading?: string

  // Dates
  loading_date?: string
  departure_date?: string
  estimated_arrival_date?: string
  actual_arrival_date?: string
  delivery_date?: string

  status: ShipmentStatus
  current_location?: string

  // Costs
  shipping_cost?: number
  shipping_currency: CurrencyType

  notes?: string

  created_at: string
  updated_at: string

  // Relations
  proforma_invoice?: ProformaInvoice
  machine?: Machine
}

export interface Expense {
  id: string
  proforma_invoice_id?: string
  shipment_id?: string
  machine_id?: string
  category: ExpenseCategory

  description: string
  amount: number
  currency: CurrencyType

  invoice_number?: string
  invoice_date?: string
  paid: boolean
  payment_date?: string

  notes?: string
  attachments?: string[]

  created_by?: string
  created_at: string
  updated_at: string

  // Relations
  proforma_invoice?: ProformaInvoice
  shipment?: Shipment
}

export interface Payment {
  id: string
  proforma_invoice_id: string

  amount: number
  currency: CurrencyType

  payment_date: string
  payment_method?: string
  reference_number?: string

  is_deposit: boolean

  notes?: string

  created_by?: string
  created_at: string
  updated_at: string

  // Relations
  proforma_invoice?: ProformaInvoice
}

export interface FinancialSummary {
  id: string
  proforma_invoice_id: string

  // Revenue
  total_revenue: number
  revenue_currency: CurrencyType

  // Costs
  purchase_cost: number
  total_expenses: number

  // Profit (calculated)
  gross_profit: number
  profit_margin?: number

  // Payments
  total_paid: number
  balance_due: number

  year?: number
  month?: number

  created_at: string
  updated_at: string

  // Relations
  proforma_invoice?: ProformaInvoice
}

// Form types for creating/updating
export type CreateMachine = Omit<Machine, 'id' | 'created_at' | 'updated_at' | 'supplier'>
export type UpdateMachine = Partial<CreateMachine>

export type CreateProformaInvoice = Omit<ProformaInvoice, 'id' | 'created_at' | 'updated_at' | 'machine' | 'customer' | 'bank_account' | 'shipments' | 'expenses' | 'payments'>
export type UpdateProformaInvoice = Partial<CreateProformaInvoice>

export type CreateShipment = Omit<Shipment, 'id' | 'created_at' | 'updated_at' | 'proforma_invoice' | 'machine'>
export type UpdateShipment = Partial<CreateShipment>

export type CreateExpense = Omit<Expense, 'id' | 'created_at' | 'updated_at' | 'proforma_invoice' | 'shipment'>
export type UpdateExpense = Partial<CreateExpense>

export type CreatePayment = Omit<Payment, 'id' | 'created_at' | 'updated_at' | 'proforma_invoice'>
export type UpdatePayment = Partial<CreatePayment>

export type CreateCompany = Omit<Company, 'id' | 'created_at' | 'updated_at'>
export type UpdateCompany = Partial<CreateCompany>

export type CreateBankAccount = Omit<BankAccount, 'id' | 'created_at' | 'updated_at'>
export type UpdateBankAccount = Partial<CreateBankAccount>
