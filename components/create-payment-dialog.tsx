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
import { Plus, Loader2 } from 'lucide-react'
import type { ProformaInvoice, CurrencyType } from '@/types/database'

export function CreatePaymentDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [invoices, setInvoices] = useState<ProformaInvoice[]>([])

  const [formData, setFormData] = useState({
    proforma_invoice_id: '',
    amount: 0,
    currency: 'USD' as CurrencyType,
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'bank_transfer',
    reference_number: '',
    is_deposit: false,
    notes: '',
  })

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (open) {
      fetchInvoices()
    }
  }, [open])

  const fetchInvoices = async () => {
    const { data } = await supabase
      .from('proforma_invoices')
      .select('*, customer:companies(*)')
      .order('created_at', { ascending: false })

    if (data) setInvoices(data)
  }

  const calculateRemaining = async (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId)
    if (!invoice) return 0

    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .eq('proforma_invoice_id', invoiceId)

    const totalPaid = (payments || []).reduce((sum, p) => sum + Number(p.amount), 0)
    const totalAmount = invoice.total_amount || invoice.unit_price
    const remaining = totalAmount - totalPaid

    return remaining > 0 ? remaining : 0
  }

  const handleSetRemaining = async () => {
    if (!formData.proforma_invoice_id) {
      alert('Önce proforma seçin!')
      return
    }

    const remaining = await calculateRemaining(formData.proforma_invoice_id)
    setFormData({ ...formData, amount: remaining })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from('payments').insert({
        proforma_invoice_id: formData.proforma_invoice_id,
        amount: formData.amount,
        currency: formData.currency,
        payment_date: formData.payment_date,
        payment_method: formData.payment_method,
        reference_number: formData.reference_number || null,
        is_deposit: formData.is_deposit,
        notes: formData.notes || null,
      })

      if (error) throw error

      // Proforma durumunu güncelle
      const invoice = invoices.find(inv => inv.id === formData.proforma_invoice_id)
      if (invoice) {
        const { data: payments } = await supabase
          .from('payments')
          .select('amount')
          .eq('proforma_invoice_id', formData.proforma_invoice_id)

        const totalPaid = (payments || []).reduce((sum, p) => sum + Number(p.amount), 0) + formData.amount
        const totalAmount = invoice.total_amount || invoice.unit_price

        let newStatus = 'pending'
        if (totalPaid >= totalAmount) {
          newStatus = 'paid'
        } else if (totalPaid > 0) {
          newStatus = 'partial'
        }

        // Proforma durumunu ve deposit_paid'i güncelle
        await supabase
          .from('proforma_invoices')
          .update({
            status: newStatus,
            deposit_paid: formData.is_deposit ? true : invoice.deposit_paid
          })
          .eq('id', formData.proforma_invoice_id)
      }

      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Hata:', error)
      alert('Ödeme eklenirken hata oluştu!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Ödeme Ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yeni Ödeme Ekle</DialogTitle>
          <DialogDescription>
            Müşteri ödemesi kaydedin
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Proforma Invoice *</Label>
            <Select
              value={formData.proforma_invoice_id}
              onValueChange={(value) => {
                const invoice = invoices.find(inv => inv.id === value)
                setFormData({
                  ...formData,
                  proforma_invoice_id: value,
                  currency: invoice?.currency || 'USD',
                })
              }}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Proforma seçin" />
              </SelectTrigger>
              <SelectContent>
                {invoices.map((invoice) => {
                  const customerName = invoice.customer?.name || '-'
                  const displayName = customerName.length > 25
                    ? `${customerName.substring(0, 10)}...${customerName.substring(customerName.length - 10)}`
                    : customerName

                  return (
                    <SelectItem key={invoice.id} value={invoice.id}>
                      <span className="hidden md:inline">
                        {invoice.invoice_number} - {customerName} ({invoice.total_amount || invoice.unit_price} {invoice.currency})
                      </span>
                      <span className="md:hidden">
                        {invoice.invoice_number} - {displayName}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="amount">Tutar *</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleSetRemaining}
                  className="h-6 text-xs"
                >
                  Kalan Ödeme
                </Button>
              </div>
              <Input
                id="amount"
                type="number"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Para Birimi</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value as CurrencyType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="TRY">TRY (₺)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_date">Ödeme Tarihi *</Label>
              <Input
                id="payment_date"
                type="date"
                required
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_method">Ödeme Yöntemi</Label>
              <Input
                id="payment_method"
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                placeholder="Banka Havalesi"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference_number">Referans Numarası</Label>
            <Input
              id="reference_number"
              value={formData.reference_number}
              onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
              placeholder="Dekont no, EFT referansı vb."
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_deposit"
              checked={formData.is_deposit}
              onChange={(e) => setFormData({ ...formData, is_deposit: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="is_deposit" className="cursor-pointer">
              Depozito ödemesi
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notlar</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ödeme Ekle
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
