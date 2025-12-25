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
import type { Shipment, ShipmentStatus, CurrencyType } from '@/types/database'
import { shipmentStatusLabels } from '@/lib/translations'

interface EditShipmentDialogProps {
  shipment: Shipment
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditShipmentDialog({ shipment, open, onOpenChange }: EditShipmentDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    loading_port: shipment.loading_port,
    destination_port: shipment.destination_port,
    shipping_company: shipment.shipping_company || '',
    container_number: shipment.container_number || '',
    bill_of_lading: shipment.bill_of_lading || '',
    loading_date: shipment.loading_date || '',
    departure_date: shipment.departure_date || '',
    estimated_arrival_date: shipment.estimated_arrival_date || '',
    actual_arrival_date: shipment.actual_arrival_date || '',
    delivery_date: shipment.delivery_date || '',
    status: shipment.status,
    current_location: shipment.current_location || '',
    shipping_cost: shipment.shipping_cost || 0,
    shipping_currency: shipment.shipping_currency,
    notes: shipment.notes || '',
  })

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setFormData({
      loading_port: shipment.loading_port,
      destination_port: shipment.destination_port,
      shipping_company: shipment.shipping_company || '',
      container_number: shipment.container_number || '',
      bill_of_lading: shipment.bill_of_lading || '',
      loading_date: shipment.loading_date || '',
      departure_date: shipment.departure_date || '',
      estimated_arrival_date: shipment.estimated_arrival_date || '',
      actual_arrival_date: shipment.actual_arrival_date || '',
      delivery_date: shipment.delivery_date || '',
      status: shipment.status,
      current_location: shipment.current_location || '',
      shipping_cost: shipment.shipping_cost || 0,
      shipping_currency: shipment.shipping_currency,
      notes: shipment.notes || '',
    })
  }, [shipment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('shipments')
        .update({
          loading_port: formData.loading_port,
          destination_port: formData.destination_port,
          shipping_company: formData.shipping_company,
          container_number: formData.container_number,
          bill_of_lading: formData.bill_of_lading,
          loading_date: formData.loading_date || null,
          departure_date: formData.departure_date || null,
          estimated_arrival_date: formData.estimated_arrival_date || null,
          actual_arrival_date: formData.actual_arrival_date || null,
          delivery_date: formData.delivery_date || null,
          status: formData.status,
          current_location: formData.current_location,
          shipping_cost: formData.shipping_cost,
          shipping_currency: formData.shipping_currency,
          notes: formData.notes,
        })
        .eq('id', shipment.id)

      if (error) throw error

      // Eğer delivered oldu ise makineyi sold yap
      if (formData.status === 'delivered' && shipment.machine_id) {
        await supabase
          .from('machines')
          .update({ status: 'sold' })
          .eq('id', shipment.machine_id)
      }

      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error('Hata:', error)
      alert('Sevkiyat güncellenirken hata oluştu!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sevkiyat Düzenle</DialogTitle>
          <DialogDescription>
            Sevkiyat bilgilerini güncelleyin
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="loading_port">Yükleme Limanı *</Label>
              <Input
                id="loading_port"
                required
                value={formData.loading_port}
                onChange={(e) => setFormData({ ...formData, loading_port: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination_port">Varış Limanı *</Label>
              <Input
                id="destination_port"
                required
                value={formData.destination_port}
                onChange={(e) => setFormData({ ...formData, destination_port: e.target.value })}
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="container_number">Konteyner No</Label>
              <Input
                id="container_number"
                value={formData.container_number}
                onChange={(e) => setFormData({ ...formData, container_number: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bill_of_lading">Konşimento</Label>
            <Input
              id="bill_of_lading"
              value={formData.bill_of_lading}
              onChange={(e) => setFormData({ ...formData, bill_of_lading: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Durum</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as ShipmentStatus })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(shipmentStatusLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimated_arrival_date">Tahmini Varış</Label>
              <Input
                id="estimated_arrival_date"
                type="date"
                value={formData.estimated_arrival_date}
                onChange={(e) => setFormData({ ...formData, estimated_arrival_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actual_arrival_date">Gerçek Varış</Label>
              <Input
                id="actual_arrival_date"
                type="date"
                value={formData.actual_arrival_date}
                onChange={(e) => setFormData({ ...formData, actual_arrival_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery_date">Teslim Tarihi</Label>
            <Input
              id="delivery_date"
              type="date"
              value={formData.delivery_date}
              onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="current_location">Mevcut Konum</Label>
            <Input
              id="current_location"
              value={formData.current_location}
              onChange={(e) => setFormData({ ...formData, current_location: e.target.value })}
              placeholder="Akdeniz - yolda"
            />
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
