import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit } from "lucide-react"
import Link from "next/link"
import { MachineActions } from "@/components/machine-actions"
import { machineStatusLabels, getMachineStatusVariant } from "@/lib/translations"
import { MachineFinancials } from "@/components/machine/machine-financials"
import { ExpenseList } from "@/components/machine/expense-list"
import { DocumentManager } from "@/components/machine/document-manager"
import type { MachineStatus } from "@/types/database"

interface MachinePageProps {
      params: Promise<{ id: string }>
}

export default async function MachinePage({ params }: MachinePageProps) {
      const { id } = await params
      const supabase = await createClient()

      // 1. Fetch Machine Details
      const { data: machine } = await supabase
            .from('machines')
            .select('*, supplier:companies(*)')
            .eq('id', id)
            .single()

      if (!machine) {
            notFound()
      }

      // 2. Fetch Expenses
      const { data: expenses } = await supabase
            .from('expenses')
            .select('*')
            .eq('machine_id', id)
            .order('created_at', { ascending: false })

      // 3. Fetch Linked Proforma Invoice (if any)
      const { data: proforma } = await supabase
            .from('proforma_invoices')
            .select('*')
            .eq('machine_id', id)
            .single()

      return (
            <SidebarProvider>
                  <AppSidebar variant="inset" />
                  <SidebarInset>
                        <SiteHeader />
                        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">

                              {/* Header */}
                              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-center gap-4">
                                          <Button variant="outline" size="icon" asChild>
                                                <Link href="/dashboard/machines">
                                                      <ArrowLeft className="h-4 w-4" />
                                                </Link>
                                          </Button>
                                          <div>
                                                <h1 className="text-xl md:text-2xl font-bold flex flex-wrap items-center gap-2">
                                                      {machine.brand} {machine.model}
                                                      <Badge variant={getMachineStatusVariant(machine.status as MachineStatus)}>
                                                            {machineStatusLabels[machine.status as MachineStatus]}
                                                      </Badge>
                                                </h1>
                                                <p className="text-muted-foreground text-sm">
                                                      {machine.machine_type} • {machine.chassis_number}
                                                </p>
                                          </div>
                                    </div>
                                    <MachineActions machine={machine} variant="detail" />
                              </div>


                              {/* Main Content */}
                              <Tabs defaultValue="overview" className="space-y-4">
                                    <TabsList className="w-full justify-start overflow-x-auto">
                                          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
                                          <TabsTrigger value="financials">Finansal Takip</TabsTrigger>
                                          <TabsTrigger value="documents">Belgeler</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="overview" className="space-y-4">
                                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                                <Card>
                                                      <CardHeader>
                                                            <CardTitle>Makine Bilgileri</CardTitle>
                                                      </CardHeader>
                                                      <CardContent className="space-y-2 text-sm">
                                                            <div className="flex justify-between border-b pb-2">
                                                                  <span className="text-muted-foreground">Marka:</span>
                                                                  <span className="font-medium">{machine.brand}</span>
                                                            </div>
                                                            <div className="flex justify-between border-b pb-2">
                                                                  <span className="text-muted-foreground">Model:</span>
                                                                  <span className="font-medium">{machine.model}</span>
                                                            </div>
                                                            <div className="flex justify-between border-b pb-2">
                                                                  <span className="text-muted-foreground">Yıl:</span>
                                                                  <span>{machine.year || '-'}</span>
                                                            </div>
                                                            <div className="flex justify-between border-b pb-2">
                                                                  <span className="text-muted-foreground">Saat:</span>
                                                                  <span>{machine.hours_used} saat</span>
                                                            </div>
                                                            <div className="flex justify-between border-b pb-2">
                                                                  <span className="text-muted-foreground">Konum:</span>
                                                                  <span>{machine.location || '-'}</span>
                                                            </div>
                                                      </CardContent>
                                                </Card>

                                                <Card>
                                                      <CardHeader>
                                                            <CardTitle>Tedarikçi Bilgileri</CardTitle>
                                                      </CardHeader>
                                                      <CardContent className="space-y-2 text-sm">
                                                            {machine.supplier ? (
                                                                  <>
                                                                        <div className="font-bold text-lg">{machine.supplier.name}</div>
                                                                        <div>{machine.supplier.contact_person}</div>
                                                                        <div>{machine.supplier.phone}</div>
                                                                        <div>{machine.supplier.email}</div>
                                                                        <div className="text-muted-foreground pt-2">{machine.supplier.address}</div>
                                                                  </>
                                                            ) : (
                                                                  <p className="text-muted-foreground">Tedarikçi bilgisi yok</p>
                                                            )}
                                                      </CardContent>
                                                </Card>

                                                <Card>
                                                      <CardHeader>
                                                            <CardTitle>Notlar</CardTitle>
                                                      </CardHeader>
                                                      <CardContent>
                                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                                  {machine.notes || 'Not eklenmemiş.'}
                                                            </p>
                                                      </CardContent>
                                                </Card>
                                          </div>
                                    </TabsContent>

                                    <TabsContent value="financials" className="space-y-4">
                                          <MachineFinancials
                                                machine={machine}
                                                expenses={expenses || []}
                                                proforma={proforma}
                                          />
                                          <ExpenseList
                                                expenses={expenses || []}
                                                machineId={machine.id}
                                          />
                                    </TabsContent>

                                    <TabsContent value="documents" className="space-y-4">
                                          <DocumentManager machine={machine} />
                                    </TabsContent>
                              </Tabs>
                        </div>
                  </SidebarInset>
            </SidebarProvider >
      )
}
