'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Package } from 'lucide-react'

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: email.split('@')[0],
          }
        },
      })

      if (error) {
        setError(error.message)
      } else if (data.user) {
        // Kayıt başarılı - otomatik giriş yap
        router.push('/dashboard')
        router.refresh()
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    }

    setLoading(false)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex items-center gap-2">
                  <Package className="h-8 w-8" />
                  <h1 className="text-2xl font-bold">AZZA</h1>
                </div>
                <p className="text-balance text-muted-foreground">
                  {isSignUp ? 'Hesap oluşturun' : 'İş Makineleri ERP Sistemi'}
                </p>
              </div>

              {error && (
                <div className={`rounded-md p-3 text-sm ${
                  error.includes('başarılı')
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                }`}>
                  {error}
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Şifre</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'İşleniyor...' : isSignUp ? 'Kayıt Ol' : 'Giriş Yap'}
              </Button>

              <div className="text-center text-sm">
                {isSignUp ? (
                  <>
                    Zaten hesabınız var mı?{" "}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(false)}
                      className="underline underline-offset-4 hover:text-primary"
                    >
                      Giriş yapın
                    </button>
                  </>
                ) : (
                  <>
                    Hesabınız yok mu?{" "}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(true)}
                      className="underline underline-offset-4 hover:text-primary"
                    >
                      Kayıt olun
                    </button>
                  </>
                )}
              </div>
            </div>
          </form>
          <div className="relative hidden bg-gradient-to-br from-blue-500 to-blue-700 md:block">
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-white">
              <Package className="mb-4 h-20 w-20" />
              <h2 className="mb-2 text-2xl font-bold">AZZA ERP</h2>
              <p className="text-center text-blue-100">
                İş makineleri alım-satım süreçlerinizi dijitalleştirin
              </p>
              <ul className="mt-6 space-y-2 text-sm text-blue-100">
                <li>✓ Makine envanteri yönetimi</li>
                <li>✓ Proforma fatura oluşturma</li>
                <li>✓ Sevkiyat takibi</li>
                <li>✓ Muhasebe ve raporlama</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground">
        AZZA İş Makineleri &copy; 2024
      </div>
    </div>
  )
}
