import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateCompanyDialog } from "@/components/create-company-dialog"
import { CompanyActions } from "@/components/company-actions"
import { createClient } from "@/lib/supabase/server"

export default async function CompaniesPage() {
  const supabase = await createClient()

  const { data: customers } = await supabase
    .from('companies')
    .select('*')
    .eq('type', 'customer')
    .order('created_at', { ascending: false })

  const { data: suppliers } = await supabase
    .from('companies')
    .select('*')
    .eq('type', 'supplier')
    .order('created_at', { ascending: false })

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Şirketler</h1>
              <p className="text-muted-foreground">Müşteri ve tedarikçi kayıtları</p>
            </div>
            <CreateCompanyDialog />
          </div>

          <Tabs defaultValue="customers" className="w-full">
            <TabsList>
              <TabsTrigger value="customers">Müşteriler ({customers?.length || 0})</TabsTrigger>
              <TabsTrigger value="suppliers">Tedarikçiler ({suppliers?.length || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value="customers" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                {customers?.map((company) => (
                  <Card key={company.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{company.name}</CardTitle>
                          <CardDescription>{company.country || 'Ülke belirtilmedi'}</CardDescription>
                        </div>
                        <CompanyActions company={company} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {company.contact_person && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">İletişim:</span>
                            <span>{company.contact_person}</span>
                          </div>
                        )}
                        {company.phone && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Telefon:</span>
                            <span>{company.phone}</span>
                          </div>
                        )}
                        {company.email && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Email:</span>
                            <span>{company.email}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="suppliers" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                {suppliers?.map((company) => (
                  <Card key={company.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{company.name}</CardTitle>
                          <CardDescription>{company.country || 'Ülke belirtilmedi'}</CardDescription>
                        </div>
                        <CompanyActions company={company} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {company.contact_person && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">İletişim:</span>
                            <span>{company.contact_person}</span>
                          </div>
                        )}
                        {company.phone && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Telefon:</span>
                            <span>{company.phone}</span>
                          </div>
                        )}
                        {company.email && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Email:</span>
                            <span>{company.email}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
