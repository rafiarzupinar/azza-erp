'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { EditPaymentDialog } from '@/components/edit-payment-dialog'
import { Edit, Trash2, Loader2 } from 'lucide-react'
import type { Payment } from '@/types/database'

interface PaymentActionsProps {
  payment: Payment
}

export function PaymentActions({ payment }: PaymentActionsProps) {
  const [deleting, setDeleting] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm(`Bu ödemeyi silmek istediğinizden emin misiniz?\n\nTutar: ${payment.amount} ${payment.currency}`)) {
      return
    }

    setDeleting(true)

    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', payment.id)

      if (error) throw error

      // Proforma durumunu güncelle
      const { data: remainingPayments } = await supabase
        .from('payments')
        .select('amount')
        .eq('proforma_invoice_id', payment.proforma_invoice_id)

      const { data: invoice } = await supabase
        .from('proforma_invoices')
        .select('total_amount, unit_price')
        .eq('id', payment.proforma_invoice_id)
        .single()

      if (invoice) {
        const totalPaid = (remainingPayments || []).reduce((sum, p) => sum + Number(p.amount), 0)
        const totalAmount = invoice.total_amount || invoice.unit_price

        let newStatus = 'pending'
        if (totalPaid >= totalAmount) {
          newStatus = 'paid'
        } else if (totalPaid > 0) {
          newStatus = 'partial'
        }

        await supabase
          .from('proforma_invoices')
          .update({ status: newStatus })
          .eq('id', payment.proforma_invoice_id)
      }

      router.refresh()
    } catch (error) {
      console.error('Hata:', error)
      alert('Ödeme silinirken hata oluştu!')
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

      <EditPaymentDialog
        payment={payment}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  )
}
