import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, FileText, ArrowLeft, TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface PageProps {
      params: Promise<{ id: string }>
}

export default async function CompanyDetailPage(props: PageProps) {
      const params = await props.params;
      const supabase = await createClient()

      const { id } = params

      // Fetch company details
      const { data: company, error } = await supabase
            .from('companies')
            .select('*')
            .eq('id', id)
            .single()

      if (error || !company) {
            return (
                  <div className="p-8 text-center text-muted-foreground">
                        Şirket bulunamadı.
                  </div>
            )
      }

      // Fetch related machines (where this company is supplier)
      const { data: suppliedMachines } = await supabase
            .from('machines')
            .select('*')
            .eq('supplier_id', id)
            .order('created_at', { ascending: false })

      // Fetch related invoices (where this company is customer)
      const { data: customerInvoices } = await supabase
            .from('proforma_invoices')
            .select('*')
            .eq('customer_id', id)
            .order('created_at', { ascending: false })

      // Calculate totals
      const totalSupplied = suppliedMachines?.length || 0
      const totalInvoices = customerInvoices?.length || 0

      const totalPurchaseVolume = suppliedMachines?.reduce((sum, m) => sum + (Number(m.purchase_price) || 0), 0) || 0
      const totalSalesVolume = customerInvoices?.reduce((sum, i) => sum + (Number(i.unit_price) || 0), 0) || 0

      return (
            <SidebarProvider>
                  <AppSidebar variant="inset" />
                  <SidebarInset>
                        <SiteHeader />
                        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">

                              {/* Header */}
                              <div className="flex items-center gap-4">
                                    <Button variant="outline" size="icon" asChild>
                                          <Link href="/dashboard/companies">
                                                <ArrowLeft className="h-4 w-4" />
                                          </Link>
                                    </Button>
                                    <div>
                                          <h1 className="text-2xl font-bold">{company.name}</h1>
                                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                                <Badge variant={company.type === 'customer' ? 'default' : 'secondary'}>
                                                      {company.type === 'customer' ? 'Müşteri' : 'Tedarikçi'}
                                                </Badge>
                                                <span>{company.country}</span>
                                          </div>
                                    </div>
                              </div>

                              {/* Stats Cards */}
                              <div className="grid gap-4 md:grid-cols-4">
                                    <Card>
                                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium">Toplam Ticaret Hacmi</CardTitle>
                                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                          </CardHeader>
                                          <CardContent>
                                                <div className="text-2xl font-bold">
                                                      ${(totalPurchaseVolume + totalSalesVolume).toLocaleString()}
                                                </div>
                                                <p className="text-xs text-muted-foreground">Genel Toplam</p>
                                          </CardContent>
                                    </Card>

                                    <Card>
                                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium">Toplam Satış (Faturalar)</CardTitle>
                                                <TrendingUp className="h-4 w-4 text-green-500" />
                                          </CardHeader>
                                          <CardContent>
                                                <div className="text-2xl font-bold text-green-600">
                                                      +${totalSalesVolume.toLocaleString()}
                                                </div>
                                                <p className="text-xs text-muted-foreground">{totalInvoices} adet fatura kesildi</p>
                                          </CardContent>
                                    </Card>

                                    <Card>
                                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium">Toplam Alım (Makineler)</CardTitle>
                                                <TrendingDown className="h-4 w-4 text-red-500" />
                                          </CardHeader>
                                          <CardContent>
                                                <div className="text-2xl font-bold text-red-600">
                                                      -${totalPurchaseVolume.toLocaleString()}
                                                </div>
                                                <p className="text-xs text-muted-foreground">{totalSupplied} adet makine alındı</p>
                                          </CardContent>
                                    </Card>

                                    <Card>
                                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium">Bakiye Durumu</CardTitle>
                                                {totalSalesVolume - totalPurchaseVolume >= 0 ?
                                                      <TrendingUp className="h-4 w-4 text-blue-500" /> :
                                                      <TrendingDown className="h-4 w-4 text-orange-500" />
                                                }
                                          </CardHeader>
                                          <CardContent>
                                                <div className={`text-2xl font-bold ${totalSalesVolume - totalPurchaseVolume >= 0 ? "text-blue-600" : "text-orange-600"}`}>
                                                      {totalSalesVolume - totalPurchaseVolume >= 0 ? "+" : ""}
                                                      ${(totalSalesVolume - totalPurchaseVolume).toLocaleString()}
                                                </div>
                                                <p className="text-xs text-muted-foreground">Net Kazanç/Gider</p>
                                          </CardContent>
                                    </Card>
                              </div>

                              <Tabs defaultValue="all" className="w-full">
                                    <TabsList>
                                          <TabsTrigger value="all">Tüm Faaliyetler</TabsTrigger>
                                          <TabsTrigger value="sales">Satışlar / Faturalar</TabsTrigger>
                                          <TabsTrigger value="purchases">Alımlar / Makineler</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="sales" className="space-y-4 pt-4">
                                          <Card>
                                                <CardHeader>
                                                      <CardTitle>Satış Geçmişi</CardTitle>
                                                      <CardDescription>Bu firmaya kesilen proforma faturalar.</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                      {customerInvoices && customerInvoices.length > 0 ? (
                                                            <div className="space-y-4">
                                                                  {customerInvoices.map((inv) => (
                                                                        <div key={inv.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                                                              <div>
                                                                                    <p className="font-medium text-sm">Fatura #{inv.invoice_number}</p>
                                                                                    <p className="text-xs text-muted-foreground">{new Date(inv.issue_date).toLocaleDateString()} - {inv.machine_type} {inv.brand} {inv.model}</p>
                                                                              </div>
                                                                              <div className="text-right">
                                                                                    <p className="font-bold">${Number(inv.unit_price).toLocaleString()}</p>
                                                                                    <Badge variant="outline" className="text-xs">{inv.status}</Badge>
                                                                              </div>
                                                                        </div>
                                                                  ))}
                                                            </div>
                                                      ) : (
                                                            <p className="text-sm text-muted-foreground">Kayıt bulunamadı.</p>
                                                      )}
                                                </CardContent>
                                          </Card>
                                    </TabsContent>

                                    <TabsContent value="purchases" className="space-y-4 pt-4">
                                          <Card>
                                                <CardHeader>
                                                      <CardTitle>Alım Geçmişi</CardTitle>
                                                      <CardDescription>Bu firmadan tedarik edilen makineler.</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                      {suppliedMachines && suppliedMachines.length > 0 ? (
                                                            <div className="space-y-4">
                                                                  {suppliedMachines.map((machine) => (
                                                                        <div key={machine.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                                                              <div>
                                                                                    <p className="font-medium text-sm">{machine.year} {machine.brand} {machine.model}</p>
                                                                                    <p className="text-xs text-muted-foreground">{new Date(machine.created_at).toLocaleDateString()} tarihinde eklendi.</p>
                                                                              </div>
                                                                              <div className="text-right">
                                                                                    <p className="font-bold text-red-600">-${Number(machine.purchase_price || 0).toLocaleString()}</p>
                                                                                    <Badge variant="outline" className="text-xs">{machine.status}</Badge>
                                                                              </div>
                                                                        </div>
                                                                  ))}
                                                            </div>
                                                      ) : (
                                                            <p className="text-sm text-muted-foreground">Kayıt bulunamadı.</p>
                                                      )}
                                                </CardContent>
                                          </Card>
                                    </TabsContent>

                                    <TabsContent value="all" className="space-y-4 pt-4">
                                          {/* Combined list logic could go here, for now simpler to show side by side or just stats */}
                                          <div className="grid gap-4 md:grid-cols-2">
                                                <Card>
                                                      <CardHeader>
                                                            <CardTitle>Son Satışlar</CardTitle>
                                                      </CardHeader>
                                                      <CardContent>
                                                            {customerInvoices?.slice(0, 5).map(inv => (
                                                                  <div key={inv.id} className="mb-4 flex justify-between border-b pb-2 last:border-0">
                                                                        <span className="text-sm">{inv.invoice_number}</span>
                                                                        <span className="text-sm font-bold text-green-600">+${Number(inv.unit_price).toLocaleString()}</span>
                                                                  </div>
                                                            ))}
                                                            {!customerInvoices?.length && <p className="text-sm text-muted-foreground">İşlem yok.</p>}
                                                      </CardContent>
                                                </Card>
                                                <Card>
                                                      <CardHeader>
                                                            <CardTitle>Son Alımlar</CardTitle>
                                                      </CardHeader>
                                                      <CardContent>
                                                            {suppliedMachines?.slice(0, 5).map(m => (
                                                                  <div key={m.id} className="mb-4 flex justify-between border-b pb-2 last:border-0">
                                                                        <span className="text-sm">{m.brand} {m.model}</span>
                                                                        <span className="text-sm font-bold text-red-600">-${Number(m.purchase_price || 0).toLocaleString()}</span>
                                                                  </div>
                                                            ))}
                                                            {!suppliedMachines?.length && <p className="text-sm text-muted-foreground">İşlem yok.</p>}
                                                      </CardContent>
                                                </Card>
                                          </div>
                                    </TabsContent>
                              </Tabs>
                        </div>
                  </SidebarInset>
            </SidebarProvider>
      )
}
