import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch dashboard stats
  const [
    { count: totalMachines },
    { count: totalInvoices },
    { count: activeShipments },
  ] = await Promise.all([
    supabase.from('machines').select('*', { count: 'exact', head: true }),
    supabase.from('proforma_invoices').select('*', { count: 'exact', head: true }),
    supabase.from('shipments').select('*', { count: 'exact', head: true }).in('status', ['pending', 'loading', 'in_transit']),
  ])

  // Calculate total revenue from paid invoices
  const { data: invoices } = await supabase
    .from('proforma_invoices')
    .select('unit_price')

  const totalRevenue = invoices?.reduce((sum, inv) => sum + (Number(inv.unit_price) || 0), 0) || 0

  // Fetch machines for table
  const { data: machines } = await supabase
    .from('machines')
    .select('id, brand, model, machine_type, status, created_at, supplier:companies(name)')
    .limit(10)
    .order('created_at', { ascending: false })

  const stats = {
    totalMachines: totalMachines || 0,
    totalInvoices: totalInvoices || 0,
    activeShipments: activeShipments || 0,
    totalRevenue: totalRevenue,
  }


  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards stats={stats} />
              <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
                <Card className="col-span-1 lg:col-span-4">
                  <CardHeader>
                    <CardTitle>Son Eklenen Makineler</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {machines?.map((machine) => (
                        <div key={machine.id} className="flex items-center">
                          <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">{machine.brand} {machine.model}</p>
                            <p className="text-sm text-muted-foreground">
                              {machine.machine_type}
                            </p>
                          </div>
                          <div className="ml-auto font-medium">
                            <Badge variant={machine.status === 'sold' ? 'secondary' : 'outline'}>
                              {machine.status === 'sold' ? 'Satıldı' : 'Stokta'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <div className="col-span-1 lg:col-span-3">
                  <ChartAreaInteractive />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
