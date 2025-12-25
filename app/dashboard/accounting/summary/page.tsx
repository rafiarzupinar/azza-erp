import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { TrendingUp, DollarSign, CreditCard, PiggyBank } from "lucide-react"

export default async function AccountingSummaryPage() {
  const supabase = await createClient()

  // Toplam gelir (tüm proforma'ların toplamı)
  const { data: invoices } = await supabase
    .from('proforma_invoices')
    .select('total_amount, unit_price, currency')

  const totalRevenue = invoices?.reduce((sum, inv) => sum + Number(inv.total_amount || inv.unit_price), 0) || 0

  // Toplam giderler
  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount, currency')

  const totalExpenses = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0

  // Toplam ödemeler (tahsilat)
  const { data: payments } = await supabase
    .from('payments')
    .select('amount')

  const totalCollected = payments?.reduce((sum, pay) => sum + Number(pay.amount), 0) || 0

  // Kar/Zarar
  const grossProfit = totalRevenue - totalExpenses
  const profitMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100) : 0

  // Bekleyen ödemeler
  const pendingPayments = totalRevenue - totalCollected

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div>
            <h1 className="text-2xl font-bold">Mali Özet</h1>
            <p className="text-muted-foreground">Genel mali durum ve kar/zarar analizi</p>
          </div>

          {/* Ana Kartlar */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Tüm proforma faturalar</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Gider</CardTitle>
                <CreditCard className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Tüm masraflar</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Brüt Kar</CardTitle>
                <TrendingUp className={`h-4 w-4 ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${grossProfit.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Kar Marjı: %{profitMargin.toFixed(1)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tahsil Edildi</CardTitle>
                <PiggyBank className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalCollected.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Bekleyen: ${pendingPayments.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detaylı Analiz */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Gelir Dağılımı</CardTitle>
                <CardDescription>Ödeme durumuna göre</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tahsil Edildi</span>
                    <span className="font-semibold text-green-600">${totalCollected.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Bekleyen Ödemeler</span>
                    <span className="font-semibold text-orange-600">${pendingPayments.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Toplam</span>
                      <span className="font-bold">${totalRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gider Analizi</CardTitle>
                <CardDescription>Toplam masraflar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Toplam Gider</span>
                    <span className="font-semibold text-red-600">${totalExpenses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Gelire Oranı</span>
                    <span className="font-medium">%{totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(1) : 0}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Net Kar</span>
                      <span className={`font-bold ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${grossProfit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
