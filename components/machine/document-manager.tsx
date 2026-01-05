'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Upload, X, Loader2, Download } from "lucide-react"
import type { Machine } from "@/types/database"

interface DocumentManagerProps {
      machine: Machine
}

export function DocumentManager({ machine }: DocumentManagerProps) {
      const [uploading, setUploading] = useState(false)
      const router = useRouter()
      const supabase = createClient()

      const documents = machine.documents || []

      const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
            if (!e.target.files || e.target.files.length === 0) return

            const file = e.target.files[0]
            setUploading(true)

            try {
                  // Check user authentication
                  const { data: { user }, error: authError } = await supabase.auth.getUser()

                  if (authError || !user) {
                        console.error('Auth User Error:', authError)
                        alert('Oturum süreniz dolmuş veya kimlik doğrulanamadı. Lütfen Çıkış Yapıp tekrar giriş yapın.')
                        return
                  }

                  console.log('User authenticated:', user.id)


                  const fileExt = file.name.split('.').pop()
                  const fileName = `${machine.id}/${Math.random().toString(36).substring(2)}.${fileExt}`
                  const filePath = `${fileName}`

                  // 1. Upload file to Supabase Storage
                  const { error: uploadError } = await supabase.storage
                        .from('documents')
                        .upload(filePath, file)

                  if (uploadError) throw uploadError

                  // 2. Get Public URL (or signed URL if private)
                  // Assuming public bucket for now, or we store the path and generate signed url on read.
                  // Usually better to store the full path or URL in the array.
                  const { data: { publicUrl } } = supabase.storage
                        .from('documents')
                        .getPublicUrl(filePath)

                  // 3. Update machine record with new document URL
                  const newDocuments = [...documents, publicUrl]

                  const { error: updateError } = await supabase
                        .from('machines')
                        .update({ documents: newDocuments })
                        .eq('id', machine.id)

                  if (updateError) throw updateError

                  router.refresh()
            } catch (error: any) {
                  console.error('Upload error:', error)
                  alert('Dosya yüklenirken hata oluştu: ' + error.message)
            } finally {
                  setUploading(false)
            }
      }

      const handleDelete = async (docUrl: string) => {
            if (!confirm('Bu belgeyi silmek istediğinize emin misiniz?')) return

            try {
                  // Remove from array
                  const newDocuments = documents.filter(d => d !== docUrl)

                  const { error } = await supabase
                        .from('machines')
                        .update({ documents: newDocuments })
                        .eq('id', machine.id)

                  if (error) throw error

                  // Note: We are not deleting from storage here to keep it simple, 
                  // but ideally we should extract the path and delete it from storage bucket too.

                  router.refresh()
            } catch (error: any) {
                  console.error('Delete error:', error)
                  alert('Belge silinirken hata oluştu')
            }
      }

      return (
            <Card>
                  <CardHeader>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                              <div>
                                    <CardTitle>Belgeler</CardTitle>
                                    <CardDescription>Fatura, dekont ve diğer belgeler</CardDescription>
                              </div>
                              <div className="relative w-full md:w-auto">
                                    <input
                                          type="file"
                                          id="file-upload"
                                          className="hidden"
                                          onChange={handleFileUpload}
                                          disabled={uploading}
                                          accept=".pdf,.jpg,.jpeg,.png"
                                    />
                                    <Button disabled={uploading} asChild className="w-full md:w-auto">
                                          <label htmlFor="file-upload" className="cursor-pointer">
                                                {uploading ? (
                                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                      <Upload className="mr-2 h-4 w-4" />
                                                )}
                                                Belge Yükle
                                          </label>
                                    </Button>
                              </div>
                        </div>
                  </CardHeader>
                  <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                              {documents.length === 0 ? (
                                    <div className="col-span-full text-center py-8 text-muted-foreground">
                                          Henüz belge yüklenmemiş
                                    </div>
                              ) : (
                                    documents.map((doc, index) => (
                                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg group hover:bg-muted/50 transition-colors">
                                                <a
                                                      href={doc}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="flex items-center gap-3 overflow-hidden"
                                                >
                                                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                            <FileText className="h-5 w-5 text-primary" />
                                                      </div>
                                                      <div className="truncate">
                                                            <div className="font-medium truncate">Belge {index + 1}</div>
                                                            <div className="text-xs text-muted-foreground">Görüntüle</div>
                                                      </div>
                                                </a>
                                                <Button
                                                      variant="ghost"
                                                      size="icon"
                                                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                                      onClick={() => handleDelete(doc)}
                                                >
                                                      <X className="h-4 w-4" />
                                                </Button>
                                          </div>
                                    ))
                              )}
                        </div>
                  </CardContent>
            </Card>
      )
}
