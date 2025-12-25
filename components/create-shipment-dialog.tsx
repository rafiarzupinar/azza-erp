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

export function CreateShipmentDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [invoices, setInvoices] = useState<ProformaInvoice[]>([])

  const [formData, setFormData] = useState({
    proforma_invoice_id: '',
    loading_port: '',
    destination_port: '',
    shipping_company: '',
    container_number: '',
    bill_of_lading: '',
    loading_date: '',
    departure_date: '',
    estimated_arrival_date: '',
    shipping_cost: 0,
    shipping_currency: 'USD' as CurrencyType,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Proforma'dan liman bilgilerini al
      const selectedInvoice = invoices.find(inv => inv.id === formData.proforma_invoice_id)

      const { error } = await supabase.from('shipments').insert({
        proforma_invoice_id: formData.proforma_invoice_id,
        machine_id: selectedInvoice?.machine_id,
        loading_port: formData.loading_port || selectedInvoice?.loading_port || '',
        destination_port: formData.destination_port || selectedInvoice?.destination_port || '',
        shipping_company: formData.shipping_company,
        container_number: formData.container_number,
        bill_of_lading: formData.bill_of_lading,
        loading_date: formData.loading_date || null,
        departure_date: formData.departure_date || null,
        estimated_arrival_date: formData.estimated_arrival_date || null,
        shipping_cost: formData.shipping_cost,
        shipping_currency: formData.shipping_currency,
        status: 'pending',
        notes: formData.notes,
      })

      if (error) throw error

      // Otomatik gider kaydı oluştur (sevkiyat ücreti)
      if (formData.shipping_cost > 0) {
        await supabase.from('expenses').insert({
          proforma_invoice_id: formData.proforma_invoice_id,
          category: 'transport',
          description: `Nakliye ucreti - ${formData.shipping_company || 'Deniz tasima'}`,
          amount: formData.shipping_cost,
          currency: formData.shipping_currency,
          paid: false,
        })
      }

      // Makine durumunu 'in_transit' yap
      if (selectedInvoice?.machine_id) {
        await supabase
          .from('machines')
          .update({ status: 'in_transit' })
          .eq('id', selectedInvoice.machine_id)
      }

      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Hata:', error)
      alert('Sevkiyat eklenirken hata oluştu!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Sevkiyat Ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yeni Sevkiyat Ekle</DialogTitle>
          <DialogDescription>
            Proforma seçerek sevkiyat kaydı oluşturun
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
                  loading_port: invoice?.loading_port || '',
                  destination_port: invoice?.destination_port || '',
                })
              }}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Proforma seçin" />
              </SelectTrigger>
              <SelectContent>
                {invoices.map((invoice) => (
                  <SelectItem key={invoice.id} value={invoice.id}>
                    {invoice.invoice_number} - {invoice.customer?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="loading_port">Yükleme Limanı *</Label>
              <Input
                id="loading_port"
                required
                value={formData.loading_port}
                onChange={(e) => setFormData({ ...formData, loading_port: e.target.value })}
                placeholder="Jeddah Port"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination_port">Varış Limanı *</Label>
              <Input
                id="destination_port"
                required
                value={formData.destination_port}
                onChange={(e) => setFormData({ ...formData, destination_port: e.target.value })}
                placeholder="Istanbul Ambarli Port"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shipping_company">Nakliye Şirketi</Label>
              <Input
                id="shipping_company"
                value={formData.shipping_company}
                onChange={(e) => setFormData({ ...formData, shipping_company: e.target.value })}
                placeholder="Maersk Line"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="container_number">Konteyner No</Label>
              <Input
                id="container_number"
                value={formData.container_number}
                onChange={(e) => setFormData({ ...formData, container_number: e.target.value })}
                placeholder="MAEU1234567"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bill_of_lading">Konşimento (Bill of Lading)</Label>
            <Input
              id="bill_of_lading"
              value={formData.bill_of_lading}
              onChange={(e) => setFormData({ ...formData, bill_of_lading: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="loading_date">Yükleme Tarihi</Label>
              <Input
                id="loading_date"
                type="date"
                value={formData.loading_date}
                onChange={(e) => setFormData({ ...formData, loading_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="departure_date">Hareket Tarihi</Label>
              <Input
                id="departure_date"
                type="date"
                value={formData.departure_date}
                onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated_arrival_date">Tahmini Varış</Label>
              <Input
                id="estimated_arrival_date"
                type="date"
                value={formData.estimated_arrival_date}
                onChange={(e) => setFormData({ ...formData, estimated_arrival_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shipping_cost">Nakliye Ücreti</Label>
              <Input
                id="shipping_cost"
                type="number"
                value={formData.shipping_cost}
                onChange={(e) => setFormData({ ...formData, shipping_cost: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Para Birimi</Label>
              <Select
                value={formData.shipping_currency}
                onValueChange={(value) => setFormData({ ...formData, shipping_currency: value as CurrencyType })}
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

          <div className="space-y-2">
            <Label htmlFor="notes">Notlar</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ek bilgiler..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sevkiyat Ekle
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
