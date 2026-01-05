'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
      Dialog,
      DialogContent,
      DialogDescription,
      DialogFooter,
      DialogHeader,
      DialogTitle,
      DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ProfileDialogProps {
      children: React.ReactNode
      user: {
            name: string
            email: string
      }
}

export function ProfileDialog({ children, user }: ProfileDialogProps) {
      const [open, setOpen] = useState(false)
      const [loading, setLoading] = useState(false)
      const [name, setName] = useState(user.name)
      const supabase = createClient()
      const router = useRouter()

      const handleUpdate = async (e: React.FormEvent) => {
            e.preventDefault()
            setLoading(true)

            try {
                  const { data: { user: authUser } } = await supabase.auth.getUser()
                  if (!authUser) throw new Error('Kullanıcı bulunamadı')

                  const { error } = await supabase
                        .from('profiles')
                        .update({ full_name: name })
                        .eq('id', authUser.id)

                  if (error) throw error

                  setOpen(false)
                  router.refresh()
            } catch (error: any) {
                  alert('Hata: ' + error.message)
            } finally {
                  setLoading(false)
            }
      }

      return (
            <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                        {children}
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                              <DialogTitle>Profili Düzenle</DialogTitle>
                              <DialogDescription>
                                    Profil bilgilerinizi buradan güncelleyebilirsiniz.
                              </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdate}>
                              <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="name" className="text-right">
                                                İsim
                                          </Label>
                                          <Input
                                                id="name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="col-span-3"
                                          />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="email" className="text-right">
                                                Email
                                          </Label>
                                          <Input
                                                id="email"
                                                value={user.email}
                                                disabled
                                                className="col-span-3 bg-muted"
                                          />
                                    </div>
                              </div>
                              <DialogFooter>
                                    <Button type="submit" disabled={loading}>
                                          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                          Kaydet
                                    </Button>
                              </DialogFooter>
                        </form>
                  </DialogContent>
            </Dialog>
      )
}
