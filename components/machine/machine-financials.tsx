'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import type { Machine, Expense, ProformaInvoice } from "@/types/database"
import { TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react"

interface MachineFinancialsProps {
      machine: Machine
      expenses: Expense[]
      proforma?: ProformaInvoice | null
}

export function MachineFinancials({ machine, expenses, proforma }: MachineFinancialsProps) {
      // Simple calculation assuming USD for now or just summing values. 
      // In a real app, currency conversion is needed.

      const purchasePrice = machine.purchase_price || 0
      const purchaseCurrency = machine.purchase_currency || 'USD'

      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

      // Sale info from Proforma
      // Note: Proforma might calculate total differently, taking simplistic approach here
      const salePrice = proforma ? (proforma.total_amount || 0) : 0
      const saleCurrency = proforma?.currency || 'USD'

      const totalCost = purchasePrice + totalExpenses

      // Only calculate profit if sold (proforma exists)
      const grossProfit = proforma ? (salePrice - totalCost) : 0
      const isProfitable = grossProfit >= 0

      return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">Alış Fiyatı</CardTitle>
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                              <div className="text-2xl font-bold">{formatCurrency(purchasePrice, purchaseCurrency)}</div>
                              <p className="text-xs text-muted-foreground">
                                    {machine.purchase_date ? new Date(machine.purchase_date).toLocaleDateString() : 'Tarih girilmedi'}
                              </p>
                        </CardContent>
                  </Card>

                  <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">Toplam Gider</CardTitle>
                              <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                              <div className="text-2xl font-bold">{formatCurrency(totalExpenses, 'USD')}</div>
                              <p className="text-xs text-muted-foreground">
                                    {expenses.length} adet işlem
                              </p>
                        </CardContent>
                  </Card>

                  <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">Satış Fiyatı</CardTitle>
                              <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                              <div className="text-2xl font-bold">
                                    {proforma ? formatCurrency(salePrice, saleCurrency) : '-'}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                    {proforma ? `Fatura: ${proforma.invoice_number}` : 'Henüz satılmadı'}
                              </p>
                        </CardContent>
                  </Card>

                  <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">Tahmini Kar</CardTitle>
                              {isProfitable ? (
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                              ) : (
                                    <TrendingDown className="h-4 w-4 text-red-500" />
                              )}
                        </CardHeader>
                        <CardContent>
                              <div className={`text-2xl font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                                    {proforma ? formatCurrency(grossProfit, 'USD') : '-'}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                    {proforma ? (isProfitable ? 'Kar' : 'Zarar') : 'Bekleniyor'}
                              </p>
                        </CardContent>
                  </Card>
            </div>
      )
}
