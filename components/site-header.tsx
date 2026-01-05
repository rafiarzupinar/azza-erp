import Link from "next/link"
import Image from "next/image"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 bg-white text-slate-900 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-16 shrink-0 items-center border-b px-4 transition-[width,height] ease-linear md:h-12 md:bg-background md:text-foreground md:px-6">

      {/* MOBILE LAYOUT (Visible only on mobile) */}
      <div className="flex w-full items-center justify-between md:hidden">
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link href="/dashboard">
            <Image
              src="/azza-logo.png"
              alt="AZZA Logo"
              width={48}
              height={48}
              className="h-12 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Center: AZZA Text */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-xl tracking-widest text-primary">
          AZZA
        </div>

        {/* Right: Menu Trigger */}
        <div className="flex items-center">
          <SidebarTrigger />
        </div>
      </div>

      {/* DESKTOP LAYOUT (Visible only on desktop - Reverted to original) */}
      <div className="hidden w-full items-center gap-2 md:flex">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 h-4"
        />
        <h1 className="text-base font-medium">Documents</h1>
      </div>

    </header>
  )
}
