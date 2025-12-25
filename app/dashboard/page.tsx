import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
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
    .select('*, supplier:companies(*)')
    .order('created_at', { ascending: false })

  const stats = {
    totalMachines: totalMachines || 0,
    totalInvoices: totalInvoices || 0,
    activeShipments: activeShipments || 0,
    totalRevenue: totalRevenue,
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards stats={stats} />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={machines || []} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
