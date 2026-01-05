import Link from "next/link"
import { TrendingDownIcon, TrendingUpIcon, Package, FileText, Ship, DollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface SectionCardsProps {
  stats: {
    totalMachines: number
    totalInvoices: number
    activeShipments: number
    totalRevenue: number
  }
}

export function SectionCards({ stats }: SectionCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-4 lg:px-6">
      <Link href="/dashboard/machines" className="block transition-all hover:scale-[1.02]">
        <Card className="h-full">
          <CardHeader className="relative">
            <CardDescription>Toplam Makineler</CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              {stats.totalMachines}
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="text-muted-foreground">
              Envanterdeki toplam makine sayısı
            </div>
          </CardFooter>
        </Card>
      </Link>

      <Link href="/dashboard/invoices" className="block transition-all hover:scale-[1.02]">
        <Card className="h-full">
          <CardHeader className="relative">
            <CardDescription>Proforma Invoice</CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              {stats.totalInvoices}
            </CardTitle>
            <div className="absolute right-4 top-4">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="text-muted-foreground">
              Oluşturulan toplam fatura
            </div>
          </CardFooter>
        </Card>
      </Link>

      <Link href="/dashboard/shipments" className="block transition-all hover:scale-[1.02]">
        <Card className="h-full">
          <CardHeader className="relative">
            <CardDescription>Aktif Sevkiyat</CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              {stats.activeShipments}
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Ship className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="text-muted-foreground">
              Devam eden sevkiyatlar
            </div>
          </CardFooter>
        </Card>
      </Link>

      <Link href="/dashboard/invoices" className="block transition-all hover:scale-[1.02]">
        <Card className="h-full">
          <CardHeader className="relative">
            <CardDescription>Toplam Gelir</CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              ${stats.totalRevenue.toLocaleString()}
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                <TrendingUpIcon className="size-3" />
                +8.2%
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium text-green-600">
              Bu ay artan gelir <TrendingUpIcon className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Son 6 ayın toplamı
            </div>
          </CardFooter>
        </Card>
      </Link>
    </div>
  )
}
