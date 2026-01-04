import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLoading() {
      return (
            <SidebarProvider>
                  <AppSidebar variant="inset" />
                  <SidebarInset>
                        <SiteHeader />
                        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                              <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                          <Skeleton key={i} className="h-32 rounded-xl" />
                                    ))}
                              </div>
                              <div className="h-[300px] w-full rounded-xl bg-muted/20" />
                              <div className="space-y-2">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-20 w-full" />
                                    <Skeleton className="h-20 w-full" />
                              </div>
                        </div>
                  </SidebarInset>
            </SidebarProvider>
      )
}
