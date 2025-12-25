import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreateExpenseDialog } from "@/components/create-expense-dialog"
import { createClient } from "@/lib/supabase/server"
import { CreditCard, Plus } from "lucide-react"
import { expenseCategoryLabels } from "@/lib/translations"

export default async function ExpensesPage() {
  const supabase = await createClient()

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*, proforma_invoice:proforma_invoices(*)')
    .order('created_at', { ascending: false })

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Giderler</h1>
              <p className="text-muted-foreground">Tüm gider kayıtları</p>
            </div>
            <CreateExpenseDialog />
          </div>

          <div className="space-y-4">
            {expenses?.map((expense) => (
              <Card key={expense.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{expense.description}</CardTitle>
                      <CardDescription>
                        {expenseCategoryLabels[expense.category]} • {expense.proforma_invoice?.invoice_number || 'Genel gider'}
                      </CardDescription>
                    </div>
                    <Badge variant={expense.paid ? 'default' : 'outline'}>
                      {expense.paid ? 'Ödendi' : 'Bekliyor'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                      {expense.amount} {expense.currency}
                    </div>
                    {expense.invoice_date && (
                      <div className="text-sm text-muted-foreground">
                        Fatura Tarihi: {new Date(expense.invoice_date).toLocaleDateString('tr-TR')}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!expenses || expenses.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Henüz gider kaydı bulunmamaktadır.</p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  İlk Gideri Ekleyin
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
