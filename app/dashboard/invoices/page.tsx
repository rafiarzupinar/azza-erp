import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { InvoiceDownloadButton } from "@/components/invoice-download-button"
import { InvoiceActions } from "@/components/invoice-actions"
import { MarkAsSoldButton } from "@/components/mark-as-sold-button"
import { CreateProformaDialog } from "@/components/create-proforma-dialog"
import { createClient } from "@/lib/supabase/server"
import { FileText } from "lucide-react"
import { paymentStatusLabels, getPaymentStatusVariant } from "@/lib/translations"

export default async function InvoicesPage() {
  const supabase = await createClient()

  const { data: invoices } = await supabase
    .from('proforma_invoices')
    .select('*, customer:companies(*), machine:machines(*), bank_account:bank_accounts(*), items:proforma_invoice_items(*, machine:machines(*))')
    .order('created_at', { ascending: false })

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Proforma Invoice</h1>
              <p className="text-muted-foreground">Tüm proforma faturalar</p>
            </div>
            <CreateProformaDialog />
          </div>

          <div className="space-y-4">
            {invoices?.map((invoice) => {
              // Tüm makineler satıldı mı kontrol et
              const allMachinesSold = invoice.items && invoice.items.length > 0
                ? invoice.items.every(item => item.machine?.status === 'sold')
                : invoice.machine?.status === 'sold'

              return (
              <Card key={invoice.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{invoice.invoice_number}</CardTitle>
                      <CardDescription>
                        {invoice.customer?.name || 'Müşteri bilgisi yok'}
                        {invoice.items && invoice.items.length > 0 && ` • ${invoice.items.length} makine`}
                        {!invoice.items && invoice.brand && ` • ${invoice.brand} ${invoice.model}`}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getPaymentStatusVariant(invoice.status)}>
                        {paymentStatusLabels[invoice.status]}
                      </Badge>
                      {(invoice.status === 'pending' || invoice.status === 'paid' || invoice.status === 'partial') && !allMachinesSold && <MarkAsSoldButton invoice={invoice} />}
                      <InvoiceDownloadButton invoice={invoice} />
                      <InvoiceActions invoice={invoice} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Toplam Tutar</p>
                      <p className="text-lg font-semibold">{invoice.total_amount || invoice.unit_price} {invoice.currency}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Teslimat</p>
                      <p className="text-sm">{invoice.loading_port || '-'} → {invoice.destination_port || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tarih</p>
                      <p className="text-sm">{new Date(invoice.issue_date).toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>

                  {invoice.payment_terms && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-1">Ödeme Koşulları</p>
                      <p className="text-sm">{invoice.payment_terms}</p>
                      {invoice.deposit_amount && (
                        <p className="text-sm mt-1">
                          Depozito: <span className="font-semibold">{invoice.deposit_amount} {invoice.currency}</span>
                          {invoice.deposit_paid && <Badge className="ml-2" variant="default">Ödendi</Badge>}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              )
            })}
          </div>

          {!invoices || invoices.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Henüz proforma fatura bulunmamaktadır.</p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  İlk Proforma'yı Oluşturun
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
