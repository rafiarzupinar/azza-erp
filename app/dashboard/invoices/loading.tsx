import { Skeleton } from "@/components/ui/skeleton"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function InvoicesLoading() {
      return (
            <SidebarProvider>
                  <AppSidebar variant="inset" />
                  <SidebarInset>
                        <SiteHeader />
                        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                              <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                          <Skeleton className="h-8 w-48" />
                                          <Skeleton className="h-4 w-32" />
                                    </div>
                                    <Skeleton className="h-10 w-40" />
                              </div>

                              <div className="space-y-4">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                          <div key={i} className="rounded-xl border bg-card text-card-foreground shadow">
                                                <div className="p-6 flex flex-col gap-4">
                                                      <div className="flex justify-between">
                                                            <div className="space-y-2">
                                                                  <Skeleton className="h-6 w-32" />
                                                                  <Skeleton className="h-4 w-48" />
                                                            </div>
                                                            <Skeleton className="h-6 w-24" />
                                                      </div>
                                                      <div className="grid gap-4 md:grid-cols-3">
                                                            <Skeleton className="h-12 w-full" />
                                                            <Skeleton className="h-12 w-full" />
                                                            <Skeleton className="h-12 w-full" />
                                                      </div>
                                                </div>
                                          </div>
                                    ))}
                              </div>
                        </div>
                  </SidebarInset>
            </SidebarProvider>
      )
}
