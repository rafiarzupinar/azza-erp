'use client'

import * as React from "react"
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowUpCircleIcon,
  BarChartIcon,
  CameraIcon,
  ClipboardListIcon,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  FolderIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  ListIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react"
import { PiBulldozer } from "react-icons/pi"
import { FaShip } from "react-icons/fa"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Makineler",
      url: "/dashboard/machines",
      icon: PiBulldozer,
    },
    {
      title: "Proforma Invoice",
      url: "/dashboard/invoices",
      icon: FileTextIcon,
    },
    {
      title: "Sevkiyat",
      url: "/dashboard/shipments",
      icon: FaShip,
    },
    {
      title: "Giderler",
      url: "/dashboard/expenses",
      icon: FileIcon,
    },
    {
      title: "Şirketler",
      url: "/dashboard/companies",
      icon: UsersIcon,
    },
    {
      title: "Ödemeler",
      url: "/dashboard/accounting/payments",
      icon: BarChartIcon,
    },
  ],
  navClouds: [
    {
      title: "Muhasebe",
      icon: BarChartIcon,
      isActive: true,
      url: "/dashboard/accounting",
      items: [
        {
          title: "Mali Özet",
          url: "/dashboard/accounting/summary",
        },
        {
          title: "Ödemeler",
          url: "/dashboard/accounting/payments",
        },
        {
          title: "Raporlar",
          url: "/dashboard/accounting/reports",
        },
      ],
    },
    {
      title: "Şirketler",
      icon: UsersIcon,
      url: "/dashboard/companies",
      items: [
        {
          title: "Müşteriler",
          url: "/dashboard/companies?type=customer",
        },
        {
          title: "Tedarikçiler",
          url: "/dashboard/companies?type=supplier",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Ayarlar",
      url: "/dashboard/settings",
      icon: SettingsIcon,
    },
    {
      title: "Banka Hesapları",
      url: "/dashboard/bank-accounts",
      icon: ClipboardListIcon,
    },
  ],
  documents: [
    {
      name: "Mali Özet",
      url: "/dashboard/accounting/summary",
      icon: ClipboardListIcon,
    },
    {
      name: "Raporlar",
      url: "/dashboard/reports",
      icon: FolderIcon,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState(data.user)
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
    const fetchUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()

        setUser({
          name: profile?.full_name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email || '',
          avatar: '',
        })
      }
    }
    fetchUser()
  }, [])

  if (!mounted) return null

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <PiBulldozer className="h-6 w-6" />
                <span className="text-base font-semibold">AZZA ERP</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
