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
import type { Payment, CurrencyType } from '@/types/database'

interface EditPaymentDialogProps {
  payment: Payment
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditPaymentDialog({ payment, open, onOpenChange }: EditPaymentDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    amount: payment.amount,
    currency: payment.currency,
    payment_date: payment.payment_date,
    payment_method: payment.payment_method || '',
    reference_number: payment.reference_number || '',
    is_deposit: payment.is_deposit,
    notes: payment.notes || '',
  })

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setFormData({
      amount: payment.amount,
      currency: payment.currency,
      payment_date: payment.payment_date,
      payment_method: payment.payment_method || '',
      reference_number: payment.reference_number || '',
      is_deposit: payment.is_deposit,
      notes: payment.notes || '',
    })
  }, [payment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('payments')
        .update({
          amount: formData.amount,
          currency: formData.currency,
          payment_date: formData.payment_date,
          payment_method: formData.payment_method,
          reference_number: formData.reference_number,
          is_deposit: formData.is_deposit,
          notes: formData.notes,
        })
        .eq('id', payment.id)

      if (error) throw error

      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error('Hata:', error)
      alert('Ödeme güncellenirken hata oluştu!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ödeme Düzenle</DialogTitle>
          <DialogDescription>
            Ödeme bilgilerini güncelleyin
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Tutar *</Label>
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
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference_number">Referans Numarası</Label>
            <Input
              id="reference_number"
              value={formData.reference_number}
              onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
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
