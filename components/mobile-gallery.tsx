'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Loader2, Image as ImageIcon } from "lucide-react"

interface GalleryImage {
      id: string
      url: string
      created_at: string
}

export function MobileGallery() {
      const [images, setImages] = useState<GalleryImage[]>([])
      const [uploading, setUploading] = useState(false)
      const [loading, setLoading] = useState(true)
      const supabase = createClient()

      useEffect(() => {
            fetchImages()
      }, [])

      const fetchImages = async () => {
            try {
                  const { data, error } = await supabase
                        .from('gallery')
                        .select('*')
                        .order('created_at', { ascending: false })

                  if (error) {
                        // If table doesn't exist yet, we might get an error. 
                        // We'll just ignore it or show empty state to avoid crashing.
                        console.error('Error fetching gallery:', error)
                        return
                  }

                  setImages(data || [])
            } catch (e) {
                  console.error(e)
            } finally {
                  setLoading(false)
            }
      }

      const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
            if (!e.target.files || e.target.files.length === 0) return

            const file = e.target.files[0]
            setUploading(true)

            try {
                  // 1. Check Auth (Double Check)
                  const { data: { user } } = await supabase.auth.getUser()
                  if (!user) {
                        alert('Lütfen önce giriş yapın')
                        return
                  }

                  // 2. Upload to Storage
                  const fileExt = file.name.split('.').pop()
                  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
                  const filePath = `${fileName}`

                  const { error: uploadError } = await supabase.storage
                        .from('gallery')
                        .upload(filePath, file)

                  if (uploadError) throw uploadError

                  // 3. Get URL
                  const { data: { publicUrl } } = supabase.storage
                        .from('gallery')
                        .getPublicUrl(filePath)

                  // 4. Save to DB
                  const { error: dbError } = await supabase
                        .from('gallery')
                        .insert([{ url: publicUrl }])

                  if (dbError) throw dbError

                  fetchImages() // Refresh list
            } catch (error: any) {
                  console.error('Upload error:', error)
                  alert('Yükleme başarısız: ' + error.message)
            } finally {
                  setUploading(false)
            }
      }

      const handleDelete = async (id: string, url: string) => {
            if (!confirm('Bu görseli silmek istiyor musunuz?')) return

            try {
                  // Delete from DB
                  const { error } = await supabase
                        .from('gallery')
                        .delete()
                        .eq('id', id)

                  if (error) throw error

                  setImages(images.filter(img => img.id !== id))
            } catch (error: any) {
                  alert('Silme hatası: ' + error.message)
            }
      }

      return (
            <Card className="border-dashed border-2">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-medium">Mobil Galeri</CardTitle>
                        <div className="relative">
                              <input
                                    type="file"
                                    id="gallery-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                              />
                              <Button size="sm" variant="secondary" disabled={uploading} asChild>
                                    <label htmlFor="gallery-upload" className="cursor-pointer">
                                          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                          <span className="ml-2">Ekle</span>
                                    </label>
                              </Button>
                        </div>
                  </CardHeader>
                  <CardContent>
                        {loading ? (
                              <div className="flex justify-center py-4">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                              </div>
                        ) : images.length === 0 ? (
                              <div className="text-center py-8 text-muted-foreground text-sm">
                                    <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    Henüz görsel yok
                              </div>
                        ) : (
                              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
                                    {images.map((img) => (
                                          <div key={img.id} className="relative group flex-none w-40 aspect-square rounded-lg overflow-hidden border bg-muted snap-center">
                                                <img
                                                      src={img.url}
                                                      alt="Gallery"
                                                      className="object-cover w-full h-full"
                                                      loading="lazy"
                                                />
                                                <button
                                                      onClick={() => handleDelete(img.id, img.url)}
                                                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full shadow-md hover:bg-red-700 transition-colors"
                                                >
                                                      <Trash2 className="h-3 w-3" />
                                                </button>
                                          </div>
                                    ))}
                              </div>
                        )}
                  </CardContent>
            </Card>
      )
}
