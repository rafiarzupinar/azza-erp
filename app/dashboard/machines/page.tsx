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
import type { Machine, MachineStatus } from "@/types/database"
import { MachineActions } from "@/components/machine-actions"
import Link from "next/link"

type MachineWithSupplier = Machine & {
  supplier: { name: string } | null
}

export default async function MachinesPage() {
  const supabase = await createClient()

  const { data: rawMachines } = await supabase
    .from('machines')
    .select('id, brand, model, machine_type, chassis_number, year, hours_used, purchase_price, purchase_currency, status, location, supplier:companies(name)')
    .order('created_at', { ascending: false })
    .limit(50)

  const machines = rawMachines as unknown as MachineWithSupplier[]

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
              <Card key={machine.id} className="hover:bg-accent/50 transition-colors cursor-pointer group relative overflow-hidden">
                <Link href={`/dashboard/machines/${machine.id}`} className="absolute inset-0 z-10">
                  <span className="sr-only">Detayları Görüntüle</span>
                </Link>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="group-hover:text-primary transition-colors">{machine.brand} {machine.model}</CardTitle>
                      <CardDescription>{machine.machine_type}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getMachineStatusVariant(machine.status as MachineStatus)}>
                        {machineStatusLabels[machine.status as MachineStatus]}
                      </Badge>
                      <div className="z-20 relative">
                        <MachineActions machine={machine} variant="list" />
                      </div>
                    </div>
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
              <CardContent className="flex flex-col items-center justify-center py-8 md:py-12">
                <Package className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">Henüz makine kaydı bulunmamaktadır.</p>
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
