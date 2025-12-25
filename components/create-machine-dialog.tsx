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
import type { Company, CurrencyType } from '@/types/database'
import { currencyLabels } from '@/lib/translations'

export function CreateMachineDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [suppliers, setSuppliers] = useState<Company[]>([])

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    machine_type: '',
    chassis_number: '',
    year: new Date().getFullYear(),
    hours_used: 0,
    purchase_price: 0,
    purchase_currency: 'USD' as CurrencyType,
    supplier_id: '',
    purchase_date: new Date().toISOString().split('T')[0],
    location: '',
    notes: '',
  })

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (open) {
      fetchSuppliers()
    }
  }, [open])

  const fetchSuppliers = async () => {
    const { data } = await supabase
      .from('companies')
      .select('*')
      .eq('type', 'supplier')

    if (data) setSuppliers(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from('machines').insert({
        ...formData,
        status: 'available',
      })

      if (error) throw error

      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Hata:', error)
      alert('Makine eklenirken hata oluştu!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Makine Ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yeni Makine Ekle</DialogTitle>
          <DialogDescription>
            Envantere yeni iş makinesi ekleyin
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Marka *</Label>
              <Input
                id="brand"
                required
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Caterpillar"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                required
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="320D"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="machine_type">Makine Tipi *</Label>
            <Input
              id="machine_type"
              required
              value={formData.machine_type}
              onChange={(e) => setFormData({ ...formData, machine_type: e.target.value })}
              placeholder="Excavator"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="chassis_number">Şase Numarası *</Label>
            <Input
              id="chassis_number"
              required
              value={formData.chassis_number}
              onChange={(e) => setFormData({ ...formData, chassis_number: e.target.value })}
              placeholder="CAT320D2024XXX"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Yıl</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours_used">Çalışma Saati</Label>
              <Input
                id="hours_used"
                type="number"
                value={formData.hours_used}
                onChange={(e) => setFormData({ ...formData, hours_used: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchase_price">Alış Fiyatı</Label>
              <Input
                id="purchase_price"
                type="number"
                value={formData.purchase_price}
                onChange={(e) => setFormData({ ...formData, purchase_price: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Para Birimi</Label>
              <Select
                value={formData.purchase_currency}
                onValueChange={(value) => setFormData({ ...formData, purchase_currency: value as CurrencyType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(currencyLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tedarikçi</Label>
            <Select
              value={formData.supplier_id}
              onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tedarikçi seçin" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name} - {supplier.country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchase_date">Satın Alma Tarihi</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Konum</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Jeddah, Saudi Arabia"
              />
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

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Makine Ekle
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
