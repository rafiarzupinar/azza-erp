import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreateShipmentDialog } from "@/components/create-shipment-dialog"
import { ShipmentActions } from "@/components/shipment-actions"
import { createClient } from "@/lib/supabase/server"
import { Ship, Plus } from "lucide-react"
import { shipmentStatusLabels, getShipmentStatusVariant } from "@/lib/translations"
import type { ShipmentStatus } from "@/types/database"

export default async function ShipmentsPage() {
  const supabase = await createClient()

  const { data: shipments } = await supabase
    .from('shipments')
    .select('*, proforma_invoice:proforma_invoices(*), machine:machines(*)')
    .order('created_at', { ascending: false })

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Sevkiyatlar</h1>
              <p className="text-muted-foreground">Tüm sevkiyat takipleri</p>
            </div>
            <CreateShipmentDialog />
          </div>

          <div className="space-y-4">
            {shipments?.map((shipment) => (
              <Card key={shipment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>
                        {shipment.loading_port} → {shipment.destination_port}
                      </CardTitle>
                      <CardDescription>
                        {shipment.shipping_company || 'Nakliye şirketi belirtilmedi'}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getShipmentStatusVariant(shipment.status as ShipmentStatus)}>
                        {shipmentStatusLabels[shipment.status as ShipmentStatus]}
                      </Badge>
                      <ShipmentActions shipment={shipment} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Konteyner</p>
                      <p className="font-medium">{shipment.container_number || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Yüklenme</p>
                      <p className="text-sm">{shipment.loading_date ? new Date(shipment.loading_date).toLocaleDateString('tr-TR') : '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tahmini Varış</p>
                      <p className="text-sm">{shipment.estimated_arrival_date ? new Date(shipment.estimated_arrival_date).toLocaleDateString('tr-TR') : '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Nakliye Ücreti</p>
                      <p className="font-semibold">{shipment.shipping_cost || 0} {shipment.shipping_currency}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!shipments || shipments.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Ship className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Henüz sevkiyat kaydı bulunmamaktadır.</p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  İlk Sevkiyatı Oluşturun
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
