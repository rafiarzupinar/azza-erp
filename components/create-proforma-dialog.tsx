'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Loader2 } from 'lucide-react'
import type { Company, BankAccount, Machine } from '@/types/database'

interface CreateProformaDialogProps {
  buttonText?: string
  fullWidth?: boolean
}

export function CreateProformaDialog({ buttonText = 'Yeni Proforma Oluştur', fullWidth = false }: CreateProformaDialogProps = {}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Company[]>([])
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [availableMachines, setAvailableMachines] = useState<Machine[]>([])
  const [selectedMachines, setSelectedMachines] = useState<string[]>([])

  const [formData, setFormData] = useState({
    customer_id: '',
    bank_account_id: '',
    invoice_number: '',
    delivery_terms: 'FOB',
    loading_port: '',
    destination_port: '',
    payment_terms: '100%',
    deposit_percentage: 0,
    profit_margin: 0,
  })

  const router = useRouter()
  const supabase = createClient()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // State defined in line 56. Removing duplicates.

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  // ... (fetchData and calculateTotals remain, handled by context or we skip them in replace)
  // To avoid replacing large chunks, I'll just insert the mounted check before return.
  // Wait, I need to add `const [mounted, setMounted]` inside the component body first.

  // Actually, I can do it in two steps.
  // 1. Add state in the beginning of function.
  // 2. Add hydration check before return.

  // Let's do step 1 (Add state)
  // I'll target the existing useEffect to add the new state and effect above it.


  const fetchData = async () => {
    const [customersRes, banksRes, machinesRes, lastInvoiceRes] = await Promise.all([
      supabase.from('companies').select('*').eq('type', 'customer'),
      supabase.from('bank_accounts').select('*').eq('is_active', true),
      supabase.from('machines').select('*').eq('status', 'available'),
      supabase.from('proforma_invoices').select('invoice_number').order('created_at', { ascending: false }).limit(1).single()
    ])

    if (customersRes.data) setCustomers(customersRes.data)
    if (banksRes.data) setBankAccounts(banksRes.data)
    if (machinesRes.data) setAvailableMachines(machinesRes.data)

    // Auto-increment Invoice Number
    const currentYear = new Date().getFullYear()
    let nextNumber = `${currentYear}001`

    if (lastInvoiceRes.data?.invoice_number) {
      const lastNumber = lastInvoiceRes.data.invoice_number
      // Check if last number starts with current year
      if (lastNumber.startsWith(currentYear.toString()) && !isNaN(Number(lastNumber))) {
        const nextSeq = Number(lastNumber) + 1
        nextNumber = nextSeq.toString()
      }
    }

    // Set default bank to Albaraka if found
    if (banksRes.data) {
      const albaraka = banksRes.data.find(b => b.bank_name.toLowerCase().includes('albaraka'))
      if (albaraka && !formData.bank_account_id) {
        setFormData(prev => ({ ...prev, bank_account_id: albaraka.id }))
      }
    }

    // Only set if we haven't manually entered one (or if it's empty)
    if (!formData.invoice_number) {
      setFormData(prev => ({ ...prev, invoice_number: nextNumber }))
    }
  }

  const calculateTotals = () => {
    const machines = availableMachines.filter(m => selectedMachines.includes(m.id))
    const totalAmount = machines.reduce((sum, m) => {
      const price = m.purchase_price ? m.purchase_price * (1 + formData.profit_margin / 100) : 0
      return sum + price
    }, 0)

    return {
      totalAmount,
      depositAmount: totalAmount * (formData.deposit_percentage / 100),
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedMachines.length === 0) {
      alert('En az bir makine seçmelisiniz!')
      return
    }

    if (!formData.customer_id) {
      alert('Lütfen bir müşteri seçin!')
      return
    }

    if (!formData.bank_account_id) {
      alert('Lütfen bir banka hesabı seçin!')
      return
    }

    setLoading(true)

    try {
      const { totalAmount, depositAmount } = calculateTotals()
      const currency = availableMachines.find(m => selectedMachines.includes(m.id))?.purchase_currency || 'USD'

      // Tek proforma invoice oluştur
      const { data: invoice, error: invoiceError } = await supabase
        .from('proforma_invoices')
        .insert({
          invoice_number: formData.invoice_number,
          customer_id: formData.customer_id,
          unit_price: totalAmount,
          total_amount: totalAmount,
          currency: currency,
          delivery_terms: formData.delivery_terms,
          loading_port: formData.loading_port,
          destination_port: formData.destination_port,
          payment_terms: formData.payment_terms,
          deposit_amount: depositAmount,
          deposit_paid: false,
          bank_account_id: formData.bank_account_id,
          status: 'pending',
        })
        .select()
        .single()

      if (invoiceError) throw invoiceError

      // Her makine için invoice item oluştur
      const items = selectedMachines.map(machineId => {
        const machine = availableMachines.find(m => m.id === machineId)!
        const unitPrice = machine.purchase_price ? machine.purchase_price * (1 + formData.profit_margin / 100) : 0

        return {
          proforma_invoice_id: invoice.id,
          machine_id: machineId,
          brand: machine.brand,
          model: machine.model,
          machine_type: machine.machine_type,
          chassis_number: machine.chassis_number,
          year: machine.year,
          unit_price: unitPrice,
          quantity: 1,
        }
      })

      const { error: itemsError } = await supabase
        .from('proforma_invoice_items')
        .insert(items)

      if (itemsError) throw itemsError

      // Makineleri 'reserved' yap
      await supabase
        .from('machines')
        .update({ status: 'reserved' })
        .in('id', selectedMachines)

      setOpen(false)
      setSelectedMachines([])
      setFormData({
        customer_id: '',
        bank_account_id: '',
        invoice_number: '',
        delivery_terms: 'FOB',
        loading_port: '',
        destination_port: '',
        payment_terms: '30% deposit, 70% before delivery',
        deposit_percentage: 30,
        profit_margin: 30,
      })
      router.refresh()
    } catch (error: any) {
      console.error('Hata:', error)
      alert(`Proforma oluşturulurken hata oluştu! Detay: ${error.message || error.toString()}`)
    } finally {
      setLoading(false)
    }
  }

  const { totalAmount, depositAmount } = selectedMachines.length > 0 ? calculateTotals() : { totalAmount: 0, depositAmount: 0 }

  if (!mounted) {
    return (
      <Button className={fullWidth ? "w-full justify-start" : ""}>
        <Plus className="mr-2 h-4 w-4" />
        <span>{buttonText}</span>
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={fullWidth ? "w-full justify-start" : ""}>
          <Plus className="mr-2 h-4 w-4" />
          <span>{buttonText}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yeni Proforma Invoice Oluştur</DialogTitle>
          <DialogDescription>
            Tek proforma'ya birden fazla makine ekleyebilirsiniz
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invoice_number">Invoice Numarası *</Label>
            <Input
              id="invoice_number"
              required
              value={formData.invoice_number}
              onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
              placeholder="PI-2024-XXX"
            />
          </div>

          <div className="space-y-2">
            <Label>Müşteri *</Label>
            <Select
              value={formData.customer_id}
              onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Müşteri seçin" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} - {customer.country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Makineler * ({selectedMachines.length} seçildi)</Label>
            <div className="border rounded-md p-4 max-h-64 overflow-y-auto space-y-3 bg-gray-50">
              {availableMachines.length === 0 ? (
                <p className="text-sm text-muted-foreground">Müsait makine bulunmamaktadır</p>
              ) : (
                availableMachines.map((machine) => (
                  <div key={machine.id} className="flex items-start space-x-3 bg-white p-3 rounded border">
                    <Checkbox
                      id={machine.id}
                      checked={selectedMachines.includes(machine.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedMachines([...selectedMachines, machine.id])
                        } else {
                          setSelectedMachines(selectedMachines.filter(id => id !== machine.id))
                        }
                      }}
                    />
                    <label
                      htmlFor={machine.id}
                      className="text-sm font-medium leading-none cursor-pointer flex-1"
                    >
                      <div>
                        <p className="font-semibold">{machine.brand} {machine.model}</p>
                        <p className="text-xs text-muted-foreground">
                          {machine.machine_type} • Şase: {machine.chassis_number}
                        </p>
                        {machine.purchase_price && (
                          <p className="text-xs font-medium text-green-600 mt-1">
                            Alış: {machine.purchase_price} {machine.purchase_currency} →
                            Satış: {(machine.purchase_price * (1 + formData.profit_margin / 100)).toFixed(0)} {machine.purchase_currency}
                          </p>
                        )}
                      </div>
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="loading_port">Yükleme Limanı *</Label>
              <Input
                id="loading_port"
                required
                value={formData.loading_port}
                onChange={(e) => setFormData({ ...formData, loading_port: e.target.value })}
                placeholder="Jeddah Port, Saudi Arabia"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination_port">Varış Limanı *</Label>
              <Input
                id="destination_port"
                required
                value={formData.destination_port}
                onChange={(e) => setFormData({ ...formData, destination_port: e.target.value })}
                placeholder="Istanbul Ambarli Port, Turkey"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery_terms">Teslimat Koşulları</Label>
            <Select
              value={formData.delivery_terms}
              onValueChange={(value) => setFormData({ ...formData, delivery_terms: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FOB">FOB (Free on Board)</SelectItem>
                <SelectItem value="CIF">CIF (Cost, Insurance, Freight)</SelectItem>
                <SelectItem value="CFR">CFR (Cost and Freight)</SelectItem>
                <SelectItem value="EXW">EXW (Ex Works)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="payment_terms">Ödeme Koşulları</Label>
              <Input
                id="payment_terms"
                value={formData.payment_terms}
                onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                placeholder="30% deposit, 70% before delivery"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deposit_percentage">Depozito Yüzdesi (%)</Label>
              <Input
                id="deposit_percentage"
                type="number"
                min="0"
                max="100"
                value={formData.deposit_percentage}
                onChange={(e) => setFormData({ ...formData, deposit_percentage: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profit_margin">Kar Marjı (%) - Alış fiyatına eklenecek</Label>
            <Input
              id="profit_margin"
              type="number"
              min="0"
              max="200"
              value={formData.profit_margin}
              onChange={(e) => setFormData({ ...formData, profit_margin: Number(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label>Banka Hesabı *</Label>
            <Select
              value={formData.bank_account_id}
              onValueChange={(value) => setFormData({ ...formData, bank_account_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Banka hesabı seçin" />
              </SelectTrigger>
              <SelectContent>
                {bankAccounts.map((bank) => (
                  <SelectItem key={bank.id} value={bank.id}>
                    {bank.bank_name} - {bank.currency} ({bank.account_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Özet */}
          {selectedMachines.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-md space-y-2">
              <h4 className="font-semibold text-sm">Özet:</h4>
              <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                <div>
                  <span className="text-muted-foreground">Seçilen Makine:</span>
                  <span className="ml-2 font-semibold">{selectedMachines.length} adet</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Toplam Tutar:</span>
                  <span className="ml-2 font-semibold">{totalAmount.toFixed(0)} USD</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Depozito ({formData.deposit_percentage}%):</span>
                  <span className="ml-2 font-semibold">{depositAmount.toFixed(0)} USD</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Kalan:</span>
                  <span className="ml-2 font-semibold">{(totalAmount - depositAmount).toFixed(0)} USD</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {selectedMachines.length} Makine ile Proforma Oluştur
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
