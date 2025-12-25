'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { EditProformaDialog } from '@/components/edit-proforma-dialog'
import { Edit, Trash2, Loader2 } from 'lucide-react'
import type { ProformaInvoice } from '@/types/database'

interface InvoiceActionsProps {
  invoice: ProformaInvoice
}

export function InvoiceActions({ invoice }: InvoiceActionsProps) {
  const [deleting, setDeleting] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm(`${invoice.invoice_number} faturasını silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!`)) {
      return
    }

    setDeleting(true)

    try {
      // İlişkili invoice items'ları sil
      const { data: items } = await supabase
        .from('proforma_invoice_items')
        .select('machine_id')
        .eq('proforma_invoice_id', invoice.id)

      await supabase
        .from('proforma_invoice_items')
        .delete()
        .eq('proforma_invoice_id', invoice.id)

      // Proforma'yı sil
      const { error } = await supabase
        .from('proforma_invoices')
        .delete()
        .eq('id', invoice.id)

      if (error) throw error

      // Makineleri 'available' yap
      if (items && items.length > 0) {
        const machineIds = items.map(item => item.machine_id)
        await supabase
          .from('machines')
          .update({ status: 'available' })
          .in('id', machineIds)
      } else if (invoice.machine_id) {
        await supabase
          .from('machines')
          .update({ status: 'available' })
          .eq('id', invoice.machine_id)
      }

      router.refresh()
    } catch (error) {
      console.error('Hata:', error)
      alert('Proforma silinirken hata oluştu! Detay: ' + error)
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

      <EditProformaDialog
        invoice={invoice}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  )
}
