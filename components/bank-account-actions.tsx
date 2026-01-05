'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Loader2 } from 'lucide-react'

interface BankAccountActionsProps {
      id: string
      name: string
}

export function BankAccountActions({ id, name }: BankAccountActionsProps) {
      const [deleting, setDeleting] = useState(false)
      const router = useRouter()
      const supabase = createClient()

      const handleDelete = async () => {
            if (!confirm(`${name} banka hesabını silmek istediğinizden emin misiniz?`)) {
                  return
            }

            setDeleting(true)

            try {
                  const { error } = await supabase
                        .from('bank_accounts')
                        .delete()
                        .eq('id', id)

                  if (error) throw error

                  router.refresh()
            } catch (error: any) {
                  console.error('Hata:', error)
                  alert('Hesap silinirken hata oluştu: ' + error.message)
            } finally {
                  setDeleting(false)
            }
      }

      return (
            <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => alert('Düzenleme henüz aktif değil')}>
                        <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="text-red-600 hover:bg-red-50"
                  >
                        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
            </div>
      )
}
