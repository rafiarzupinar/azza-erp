import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import { Plus, Building } from "lucide-react"
import { CreateBankAccountDialog } from "@/components/create-bank-account-dialog"
import { BankAccountActions } from "@/components/bank-account-actions"

export default async function BankAccountsPage() {
  const supabase = await createClient()

  const { data: bankAccounts } = await supabase
    .from('bank_accounts')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Banka Hesapları</h1>
              <p className="text-muted-foreground">Tüm banka hesapları</p>
            </div>
            <CreateBankAccountDialog />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {bankAccounts?.map((account) => (
              <Card key={account.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{account.bank_name}</CardTitle>
                      <CardDescription>{account.account_holder}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>{account.currency}</Badge>
                      <BankAccountActions id={account.id} name={account.bank_name} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hesap No:</span>
                      <span className="font-mono">{account.account_number}</span>
                    </div>
                    {account.iban && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">IBAN:</span>
                        <span className="font-mono text-xs">{account.iban}</span>
                      </div>
                    )}
                    {account.swift_code && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">SWIFT:</span>
                        <span className="font-mono">{account.swift_code}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
