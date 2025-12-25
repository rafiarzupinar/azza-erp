'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  FileText,
  Ship,
  CreditCard,
  Building2,
  Settings,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Makineler', href: '/dashboard/machines', icon: Package },
  { name: 'Proforma Invoice', href: '/dashboard/invoices', icon: FileText },
  { name: 'Sevkiyat', href: '/dashboard/shipments', icon: Ship },
  { name: 'Giderler', href: '/dashboard/expenses', icon: CreditCard },
  { name: 'Şirketler', href: '/dashboard/companies', icon: Building2 },
  { name: 'Ayarlar', href: '/dashboard/settings', icon: Settings },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col border-r bg-sidebar">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Package className="h-6 w-6" />
          <span className="text-lg">AZZA ERP</span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="border-t p-4">
        <form action="/auth/signout" method="post">
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Çıkış Yap
          </Button>
        </form>
      </div>
    </div>
  )
}
