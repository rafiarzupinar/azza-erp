'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Loader2 } from 'lucide-react'
import type { Machine } from '@/types/database'

interface MachineActionsProps {
      machine: Machine
      variant?: 'list' | 'detail'
}

export function MachineActions({ machine, variant = 'list' }: MachineActionsProps) {
      const [deleting, setDeleting] = useState(false)
      const router = useRouter()
      const supabase = createClient()

      const handleDelete = async () => {
            if (!confirm(`${machine.brand} ${machine.model} makinesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
                  return
            }

            setDeleting(true)

            try {
                  const { error } = await supabase
                        .from('machines')
                        .delete()
                        .eq('id', machine.id)

                  if (error) throw error

                  if (variant === 'detail') {
                        router.push('/dashboard/machines')
                  } else {
                        router.refresh()
                  }

            } catch (error: any) {
                  console.error('Hata:', error)
                  alert('Makine silinirken hata oluştu: ' + error.message)
            } finally {
                  setDeleting(false)
            }
      }

      return (
            <div className="flex gap-2" onClick={(e) => {
                  // Prevent parent links from taking over
                  e.preventDefault()
                  e.stopPropagation()
            }}>
                  {/* Edit button placeholder - can be hooked up to a dialog later */}
                  <Button size="sm" variant="outline" onClick={() => alert('Düzenleme henüz aktif değil')}>
                        <Edit className="h-4 w-4" />
                        {variant === 'detail' && <span className="ml-2">Düzenle</span>}
                  </Button>

                  <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="text-red-600 hover:bg-red-50"
                  >
                        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        {variant === 'detail' && <span className="ml-2">Sil</span>}
                  </Button>
            </div>
      )
}
