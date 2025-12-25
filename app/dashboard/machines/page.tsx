import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreateMachineDialog } from "@/components/create-machine-dialog"
import { createClient } from "@/lib/supabase/server"
import { Package, Plus } from "lucide-react"
import { machineStatusLabels, getMachineStatusVariant } from "@/lib/translations"

export default async function MachinesPage() {
  const supabase = await createClient()

  const { data: machines } = await supabase
    .from('machines')
    .select('*, supplier:companies(*)')
    .order('created_at', { ascending: false })

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Makineler</h1>
              <p className="text-muted-foreground">Tüm iş makineleri envanteri</p>
            </div>
            <CreateMachineDialog />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {machines?.map((machine) => (
              <Card key={machine.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{machine.brand} {machine.model}</CardTitle>
                      <CardDescription>{machine.machine_type}</CardDescription>
                    </div>
                    <Badge variant={getMachineStatusVariant(machine.status)}>
                      {machineStatusLabels[machine.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Şase No:</span>
                      <span className="font-medium">{machine.chassis_number}</span>
                    </div>
                    {machine.year && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Yıl:</span>
                        <span>{machine.year}</span>
                      </div>
                    )}
                    {machine.hours_used && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Saat:</span>
                        <span>{machine.hours_used} saat</span>
                      </div>
                    )}
                    {machine.purchase_price && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Alış Fiyatı:</span>
                        <span className="font-semibold">{machine.purchase_price} {machine.purchase_currency}</span>
                      </div>
                    )}
                    {machine.supplier && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tedarikçi:</span>
                        <span>{machine.supplier.name}</span>
                      </div>
                    )}
                    {machine.location && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Konum:</span>
                        <span>{machine.location}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!machines || machines.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Henüz makine kaydı bulunmamaktadır.</p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  İlk Makineyi Ekleyin
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
