'use client'

import { useState } from 'react'
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
import type { CurrencyType } from '@/types/database'
import { currencyLabels } from '@/lib/translations'
import { useEffect } from 'react'

export function CreateBankAccountDialog() {
      const [open, setOpen] = useState(false)
      const [loading, setLoading] = useState(false)
      const [mounted, setMounted] = useState(false)

      const [formData, setFormData] = useState({
            bank_name: '',
            account_holder: '',
            account_number: '',
            iban: '',
            swift_code: '',
            currency: 'USD' as CurrencyType,
      })

      const router = useRouter()
      const supabase = createClient()

      useEffect(() => {
            setMounted(true)
      }, [])

      const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault()
            setLoading(true)

            try {
                  const { error } = await supabase.from('bank_accounts').insert({
                        ...formData,
                        is_active: true,
                  })

                  if (error) throw error

                  setOpen(false)
                  router.refresh()
            } catch (error: any) {
                  console.error('Hata:', error)
                  alert(`Hesap eklenirken hata oluştu! Detay: ${error.message || error.toString()}`)
            } finally {
                  setLoading(false)
            }
      }

      if (!mounted) {
            return (
                  <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Yeni Hesap Ekle
                  </Button>
            )
      }

      return (
            <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                        <Button>
                              <Plus className="mr-2 h-4 w-4" />
                              Yeni Hesap Ekle
                        </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                        <DialogHeader>
                              <DialogTitle>Yeni Banka Hesabı Ekle</DialogTitle>
                              <DialogDescription>
                                    Ödeme işlemleri için yeni bir banka hesabı tanımlayın
                              </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                          <Label htmlFor="bank_name">Banka Adı *</Label>
                                          <Input
                                                id="bank_name"
                                                required
                                                value={formData.bank_name}
                                                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                                placeholder="Ziraat Bankası"
                                          />
                                    </div>
                                    <div className="space-y-2">
                                          <Label htmlFor="account_holder">Hesap Sahibi *</Label>
                                          <Input
                                                id="account_holder"
                                                required
                                                value={formData.account_holder}
                                                onChange={(e) => setFormData({ ...formData, account_holder: e.target.value })}
                                                placeholder="Şirket Ünvanı"
                                          />
                                    </div>
                              </div>

                              <div className="space-y-2">
                                    <Label htmlFor="account_number">Hesap Numarası *</Label>
                                    <Input
                                          id="account_number"
                                          required
                                          value={formData.account_number}
                                          onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                                    />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                          <Label htmlFor="iban">IBAN</Label>
                                          <Input
                                                id="iban"
                                                value={formData.iban}
                                                onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                                                placeholder="TR..."
                                          />
                                    </div>
                                    <div className="space-y-2">
                                          <Label htmlFor="swift_code">SWIFT Kodu</Label>
                                          <Input
                                                id="swift_code"
                                                value={formData.swift_code}
                                                onChange={(e) => setFormData({ ...formData, swift_code: e.target.value })}
                                          />
                                    </div>
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
                                                {Object.entries(currencyLabels).map(([key, label]) => (
                                                      <SelectItem key={key} value={key}>
                                                            {label}
                                                      </SelectItem>
                                                ))}
                                          </SelectContent>
                                    </Select>
                              </div>

                              <div className="flex justify-end gap-2 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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
