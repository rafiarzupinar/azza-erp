'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { EditShipmentDialog } from '@/components/edit-shipment-dialog'
import { Edit, Trash2, Loader2 } from 'lucide-react'
import type { Shipment } from '@/types/database'

interface ShipmentActionsProps {
  shipment: Shipment
}

export function ShipmentActions({ shipment }: ShipmentActionsProps) {
  const [deleting, setDeleting] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm(`Bu sevkiyatı silmek istediğinizden emin misiniz?\n\nKonteyner: ${shipment.container_number || 'Yok'}`)) {
      return
    }

    setDeleting(true)

    try {
      const { error } = await supabase
        .from('shipments')
        .delete()
        .eq('id', shipment.id)

      if (error) throw error

      // Makineyi 'reserved' duruma geri al
      if (shipment.machine_id) {
        await supabase
          .from('machines')
          .update({ status: 'reserved' })
          .eq('id', shipment.machine_id)
      }

      router.refresh()
    } catch (error) {
      console.error('Hata:', error)
      alert('Sevkiyat silinirken hata oluştu!')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setEditOpen(true)}
          className="hover:bg-blue-50"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
      </div>

      <EditShipmentDialog
        shipment={shipment}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  )
}
