'use client'

import { useState } from 'react'
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { createClient } from '@/lib/supabase/client'
import { generateProformaInvoicePDF } from "@/lib/pdf-generator"
import type { ProformaInvoice, BankAccount, Company } from "@/types/database"

interface InvoiceDownloadButtonProps {
  invoice: ProformaInvoice & {
    customer: Company | null
    bank_account: BankAccount | null
  }
}

export function InvoiceDownloadButton({ invoice }: InvoiceDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const supabase = createClient()

  const handleDownload = async () => {
    if (!invoice.customer || !invoice.bank_account) {
      alert('Fatura eksik bilgiler içeriyor!')
      return
    }

    setIsGenerating(true)

    try {
      // Fetch invoice items
      const { data: items } = await supabase
        .from('proforma_invoice_items')
        .select('*')
        .eq('proforma_invoice_id', invoice.id)
        .order('created_at', { ascending: true })

      // Eğer items yoksa (eski sistem), backward compatibility için
      const invoiceItems = items && items.length > 0 ? items : [{
        id: invoice.id,
        proforma_invoice_id: invoice.id,
        machine_id: invoice.machine_id || '',
        brand: invoice.brand || '',
        model: invoice.model || '',
        machine_type: invoice.machine_type || '',
        chassis_number: invoice.chassis_number || '',
        year: invoice.machine?.year,
        unit_price: invoice.unit_price,
        quantity: 1,
        total_price: invoice.unit_price,
        created_at: invoice.created_at,
        updated_at: invoice.updated_at,
      }]

      await new Promise(resolve => setTimeout(resolve, 300))

      generateProformaInvoicePDF({
        ...invoice,
        customer: invoice.customer,
        bank_account: invoice.bank_account,
        items: invoiceItems,
      })
    } catch (error) {
      console.error('PDF oluşturma hatası:', error)
      alert('PDF oluşturulurken bir hata oluştu!')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            disabled={isGenerating}
            className="hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>PDF İndir</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
