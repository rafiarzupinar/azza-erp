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
import { Loader2 } from 'lucide-react'
import type { ProformaInvoice, Company, BankAccount, PaymentStatus } from '@/types/database'
import { paymentStatusLabels } from '@/lib/translations'

interface EditProformaDialogProps {
  invoice: ProformaInvoice
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditProformaDialog({ invoice, open, onOpenChange }: EditProformaDialogProps) {
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Company[]>([])
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])

  const [formData, setFormData] = useState({
    customer_id: invoice.customer_id,
    delivery_terms: invoice.delivery_terms || '',
    loading_port: invoice.loading_port || '',
    destination_port: invoice.destination_port || '',
    payment_terms: invoice.payment_terms || '',
    deposit_amount: invoice.deposit_amount || 0,
    deposit_paid: invoice.deposit_paid,
    bank_account_id: invoice.bank_account_id || '',
    status: invoice.status,
    validity_date: invoice.validity_date || '',
    notes: invoice.notes || '',
  })

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (open) {
      fetchData()
      setFormData({
        customer_id: invoice.customer_id,
        delivery_terms: invoice.delivery_terms || '',
        loading_port: invoice.loading_port || '',
        destination_port: invoice.destination_port || '',
        payment_terms: invoice.payment_terms || '',
        deposit_amount: invoice.deposit_amount || 0,
        deposit_paid: invoice.deposit_paid,
        bank_account_id: invoice.bank_account_id || '',
        status: invoice.status,
        validity_date: invoice.validity_date || '',
        notes: invoice.notes || '',
      })
    }
  }, [open, invoice])

  const fetchData = async () => {
    const [customersRes, banksRes] = await Promise.all([
      supabase.from('companies').select('*').eq('type', 'customer'),
      supabase.from('bank_accounts').select('*').eq('is_active', true),
    ])

    if (customersRes.data) setCustomers(customersRes.data)
    if (banksRes.data) setBankAccounts(banksRes.data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('proforma_invoices')
        .update({
          customer_id: formData.customer_id,
          delivery_terms: formData.delivery_terms,
          loading_port: formData.loading_port,
          destination_port: formData.destination_port,
          payment_terms: formData.payment_terms,
          deposit_amount: formData.deposit_amount,
          deposit_paid: formData.deposit_paid,
          bank_account_id: formData.bank_account_id,
          status: formData.status,
          validity_date: formData.validity_date || null,
          notes: formData.notes,
        })
        .eq('id', invoice.id)

      if (error) throw error

      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error('Hata:', error)
      alert('Proforma güncellenirken hata oluştu!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Proforma Düzenle</DialogTitle>
          <DialogDescription>
            {invoice.invoice_number} - Fatura bilgilerini güncelleyin
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Müşteri</Label>
            <Select
              value={formData.customer_id}
              onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
            >
              <SelectTrigger>
                <SelectValue />
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="loading_port">Yükleme Limanı</Label>
              <Input
                id="loading_port"
                value={formData.loading_port}
                onChange={(e) => setFormData({ ...formData, loading_port: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination_port">Varış Limanı</Label>
              <Input
                id="destination_port"
                value={formData.destination_port}
                onChange={(e) => setFormData({ ...formData, destination_port: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery_terms">Teslimat Koşulları</Label>
            <Input
              id="delivery_terms"
              value={formData.delivery_terms}
              onChange={(e) => setFormData({ ...formData, delivery_terms: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_terms">Ödeme Koşulları</Label>
            <Input
              id="payment_terms"
              value={formData.payment_terms}
              onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deposit_amount">Depozito Tutarı</Label>
              <Input
                id="deposit_amount"
                type="number"
                value={formData.deposit_amount}
                onChange={(e) => setFormData({ ...formData, deposit_amount: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validity_date">Geçerlilik Tarihi</Label>
              <Input
                id="validity_date"
                type="date"
                value={formData.validity_date}
                onChange={(e) => setFormData({ ...formData, validity_date: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="deposit_paid"
              checked={formData.deposit_paid}
              onChange={(e) => setFormData({ ...formData, deposit_paid: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="deposit_paid" className="cursor-pointer">
              Depozito ödendi
            </Label>
          </div>

          <div className="space-y-2">
            <Label>Durum</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as PaymentStatus })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(paymentStatusLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Banka Hesabı</Label>
            <Select
              value={formData.bank_account_id}
              onValueChange={(value) => setFormData({ ...formData, bank_account_id: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {bankAccounts.map((bank) => (
                  <SelectItem key={bank.id} value={bank.id}>
                    {bank.bank_name} - {bank.currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Kaydet
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
