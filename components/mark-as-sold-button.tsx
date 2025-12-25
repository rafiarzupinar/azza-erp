'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2 } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { ProformaInvoice } from '@/types/database'

interface MarkAsSoldButtonProps {
  invoice: ProformaInvoice
}

export function MarkAsSoldButton({ invoice }: MarkAsSoldButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleMarkAsSold = async () => {
    if (!confirm(`${invoice.invoice_number} faturasındaki tüm makineleri "Satıldı" olarak işaretlemek istediğinizden emin misiniz?`)) {
      return
    }

    setLoading(true)

    try {
      // Get all machines from this invoice
      const { data: items } = await supabase
        .from('proforma_invoice_items')
        .select('machine_id')
        .eq('proforma_invoice_id', invoice.id)

      // Update invoice status to paid
      await supabase
        .from('proforma_invoices')
        .update({ status: 'paid' })
        .eq('id', invoice.id)

      // Update all machines to sold
      if (items && items.length > 0) {
        const machineIds = items.map(item => item.machine_id)
        await supabase
          .from('machines')
          .update({ status: 'sold' })
          .in('id', machineIds)
      } else if (invoice.machine_id) {
        await supabase
          .from('machines')
          .update({ status: 'sold' })
          .eq('id', invoice.machine_id)
      }

      router.refresh()
    } catch (error) {
      console.error('Hata:', error)
      alert('Durum güncellenirken hata oluştu!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            onClick={handleMarkAsSold}
            disabled={loading}
            className="hover:bg-green-50 hover:text-green-700"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Satıldı Olarak İşaretle</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
