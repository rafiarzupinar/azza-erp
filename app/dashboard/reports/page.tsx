import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExportReportButton } from "@/components/export-report-button"
import { createClient } from "@/lib/supabase/server"
import { TrendingUp, DollarSign, CreditCard } from "lucide-react"

export default async function ReportsPage() {
  const supabase = await createClient()

  // Tüm proforma'ları çek
  const { data: allInvoices } = await supabase
    .from('proforma_invoices')
    .select('*, customer:companies(*)')
    .order('issue_date', { ascending: false })

  // Tüm giderleri çek
  const { data: allExpenses } = await supabase
    .from('expenses')
    .select('*')

  // Tüm ödemeleri çek
  const { data: allPayments } = await supabase
    .from('payments')
    .select('*')

  // Aylık gruplandırma
  const monthlyData: Record<string, { revenue: number, expenses: number, count: number, invoices: any[], expensesList: any[], paymentsList: any[] }> = {}

  allInvoices?.forEach(invoice => {
    const date = new Date(invoice.issue_date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { revenue: 0, expenses: 0, count: 0, invoices: [], expensesList: [], paymentsList: [] }
    }

    monthlyData[monthKey].revenue += Number(invoice.total_amount || invoice.unit_price)
    monthlyData[monthKey].count += 1
    monthlyData[monthKey].invoices.push(invoice)
  })

  // Giderleri aylara göre grupla
  allExpenses?.forEach(expense => {
    const date = expense.created_at ? new Date(expense.created_at) : new Date()
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    if (monthlyData[monthKey]) {
      monthlyData[monthKey].expenses += Number(expense.amount)
      monthlyData[monthKey].expensesList.push(expense)
    }
  })

  // Ödemeleri aylara göre grupla
  allPayments?.forEach(payment => {
    const date = payment.payment_date ? new Date(payment.payment_date) : new Date()
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    if (monthlyData[monthKey]) {
      monthlyData[monthKey].paymentsList.push(payment)
    }
  })

  // Son 12 ay
  const last12Months = Object.entries(monthlyData)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 12)
    .reverse()

  const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div>
            <h1 className="text-2xl font-bold">Aylık Satış Raporları</h1>
            <p className="text-muted-foreground">Detaylı gelir-gider analizleri ve PDF export</p>
          </div>

          {/* Aylık Raporlar */}
          <div className="space-y-4">
            {last12Months.map(([month, data]) => {
              const [year, monthNum] = month.split('-')
              const monthName = monthNames[parseInt(monthNum) - 1]
              const profit = data.revenue - data.expenses
              const profitMargin = data.revenue > 0 ? ((profit / data.revenue) * 100) : 0

              return (
                <Card key={month}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{monthName} {year}</CardTitle>
                        <CardDescription>{data.count} proforma fatura</CardDescription>
                      </div>
                      <ExportReportButton
                        reportData={{
                          month: `${monthName} ${year}`,
                          invoices: data.invoices,
                          expenses: data.expensesList || [],
                          payments: data.paymentsList || [],
                          totalRevenue: data.revenue,
                          totalExpenses: data.expenses,
                          profit: profit,
                        }}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      {/* Gelir */}
                      <div className="flex flex-col space-y-1 p-4 bg-green-50 rounded-md border border-green-200">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="text-xs font-medium text-green-700">Gelir</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">${data.revenue.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{data.count} fatura</p>
                      </div>

                      {/* Gider */}
                      <div className="flex flex-col space-y-1 p-4 bg-red-50 rounded-md border border-red-200">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-red-600" />
                          <span className="text-xs font-medium text-red-700">Gider</span>
                        </div>
                        <p className="text-2xl font-bold text-red-600">${data.expenses.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Toplam masraf</p>
                      </div>

                      {/* Kar */}
                      <div className={`flex flex-col space-y-1 p-4 rounded-md border ${
                        profit >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'
                      }`}>
                        <div className="flex items-center gap-2">
                          <TrendingUp className={`h-4 w-4 ${profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                          <span className={`text-xs font-medium ${profit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                            Net Kar
                          </span>
                        </div>
                        <p className={`text-2xl font-bold ${profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                          ${profit.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">%{profitMargin.toFixed(1)} marj</p>
                      </div>

                      {/* Ortalama */}
                      <div className="flex flex-col space-y-1 p-4 bg-gray-50 rounded-md border border-gray-200">
                        <span className="text-xs font-medium text-gray-700">Ortalama Fatura</span>
                        <p className="text-2xl font-bold">${(data.revenue / data.count).toFixed(0)}</p>
                        <p className="text-xs text-muted-foreground">Fatura başı</p>
                      </div>
                    </div>

                    {/* Fatura Listesi */}
                    <div className="mt-6 space-y-2">
                      <h4 className="font-semibold text-sm">Bu Aydaki Faturalar:</h4>
                      <div className="space-y-2">
                        {data.invoices.map(inv => (
                          <div key={inv.id} className="flex items-center justify-between text-sm p-2 border rounded">
                            <span>{inv.invoice_number} - {inv.customer?.name}</span>
                            <span className="font-semibold">${Number(inv.total_amount || inv.unit_price).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {last12Months.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Henüz rapor verisi bulunmamaktadır.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
