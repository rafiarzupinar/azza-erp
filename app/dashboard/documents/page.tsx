import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DocumentsPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div>
            <h1 className="text-2xl font-bold">Belgeler</h1>
            <p className="text-muted-foreground">Tüm belgeler ve dökümanlar</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Belge Yönetimi</CardTitle>
              <CardDescription>Geliştirilme aşamasında</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Belge yönetim sistemi yakında eklenecek...</p>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
