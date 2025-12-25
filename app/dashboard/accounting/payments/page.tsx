import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreatePaymentDialog } from "@/components/create-payment-dialog"
import { PaymentActions } from "@/components/payment-actions"
import { createClient } from "@/lib/supabase/server"

export default async function PaymentsPage() {
  const supabase = await createClient()

  const { data: payments } = await supabase
    .from('payments')
    .select('*, proforma_invoice:proforma_invoices(*)')
    .order('payment_date', { ascending: false })

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Ödemeler</h1>
              <p className="text-muted-foreground">Müşteri ödemeleri ve tahsilatlar</p>
            </div>
            <CreatePaymentDialog />
          </div>

          <div className="space-y-4">
            {payments?.map((payment) => (
              <Card key={payment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{payment.proforma_invoice?.invoice_number || 'Fatura bulunamadı'}</CardTitle>
                      <CardDescription>
                        {new Date(payment.payment_date).toLocaleDateString('tr-TR')} • {payment.payment_method || 'Ödeme yöntemi belirtilmedi'}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={payment.is_deposit ? 'secondary' : 'default'}>
                        {payment.is_deposit ? 'Depozito' : 'Ödeme'}
                      </Badge>
                      {payment.proforma_invoice?.deposit_paid && payment.is_deposit && (
                        <Badge variant="outline" className="text-green-600">
                          Onaylandı
                        </Badge>
                      )}
                      <PaymentActions payment={payment} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {payment.amount} {payment.currency}
                  </div>
                  {payment.reference_number && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Referans: {payment.reference_number}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
