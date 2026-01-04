'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreateExpenseDialog } from "@/components/create-expense-dialog"
import { expenseCategoryLabels } from "@/lib/translations"
import type { Expense } from "@/types/database"
import { formatCurrency } from "@/lib/utils"

interface ExpenseListProps {
      expenses: Expense[]
      machineId: string
}

export function ExpenseList({ expenses, machineId }: ExpenseListProps) {
      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

      return (
            <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Giderler</CardTitle>
                        <CreateExpenseDialog machineId={machineId} />
                  </CardHeader>
                  <CardContent>
                        <div className="mb-4">
                              <span className="text-sm text-muted-foreground mr-2">Toplam Gider:</span>
                              <span className="text-xl font-bold">{formatCurrency(totalExpenses, 'USD')}</span>
                        </div>

                        <div className="space-y-4">
                              {expenses.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Henüz gider kaydı bulunmuyor.</p>
                              ) : (
                                    expenses.map((expense) => (
                                          <div key={expense.id} className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 last:border-0 last:pb-0 gap-2">
                                                <div>
                                                      <div className="font-medium">{expense.description}</div>
                                                      <div className="text-sm text-muted-foreground">
                                                            {expenseCategoryLabels[expense.category]}
                                                            {expense.invoice_date && ` • ${new Date(expense.invoice_date).toLocaleDateString()}`}
                                                      </div>
                                                </div>
                                                <div className="flex items-center justify-between md:block md:text-right">
                                                      <div className="font-medium">{formatCurrency(expense.amount, expense.currency)}</div>
                                                      <Badge variant={expense.paid ? "outline" : "secondary"}>
                                                            {expense.paid ? "Ödendi" : "Ödenecek"}
                                                      </Badge>
                                                </div>
                                          </div>
                                    ))
                              )}
                        </div>
                  </CardContent>
            </Card>
      )
}
