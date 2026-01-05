import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Loading() {
      return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                  <div className="flex items-center justify-between">
                        <div className="space-y-2">
                              <Skeleton className="h-8 w-[200px]" />
                              <Skeleton className="h-4 w-[250px]" />
                        </div>
                        <Skeleton className="h-10 w-[120px]" />
                  </div>

                  <div className="mt-4">
                        <div className="mb-4 flex gap-4">
                              <Skeleton className="h-10 w-[100px]" />
                              <Skeleton className="h-10 w-[100px]" />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                              {Array.from({ length: 4 }).map((_, i) => (
                                    <Card key={i} className="h-full">
                                          <CardHeader>
                                                <div className="flex justify-between">
                                                      <div className="space-y-2">
                                                            <Skeleton className="h-6 w-[150px]" />
                                                            <Skeleton className="h-4 w-[100px]" />
                                                      </div>
                                                      <Skeleton className="h-8 w-8 rounded-full" />
                                                </div>
                                          </CardHeader>
                                          <CardContent>
                                                <div className="space-y-2">
                                                      <Skeleton className="h-4 w-full" />
                                                      <Skeleton className="h-4 w-[80%]" />
                                                </div>
                                          </CardContent>
                                    </Card>
                              ))}
                        </div>
                  </div>
            </div>
      )
}
