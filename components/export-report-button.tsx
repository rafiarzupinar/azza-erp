'use client'

import { useState } from 'react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'

interface ReportData {
  month: string
  invoices: any[]
  expenses: any[]
  payments: any[]
  totalRevenue: number
  totalExpenses: number
  profit: number
}

interface ExportReportButtonProps {
  reportData: ReportData
}

function normalizeText(text: string): string {
  return text
    .replace(/İ/g, 'I')
    .replace(/ı/g, 'i')
    .replace(/Ğ/g, 'G')
    .replace(/ğ/g, 'g')
    .replace(/Ü/g, 'U')
    .replace(/ü/g, 'u')
    .replace(/Ş/g, 'S')
    .replace(/ş/g, 's')
    .replace(/Ö/g, 'O')
    .replace(/ö/g, 'o')
    .replace(/Ç/g, 'C')
    .replace(/ç/g, 'c')
}

export function ExportReportButton({ reportData }: ExportReportButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)

    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 15

      // Header
      doc.setDrawColor(0)
      doc.setLineWidth(1)
      doc.line(margin, 25, pageWidth - margin, 25)
      doc.line(margin, 27, pageWidth - margin, 27)

      doc.setFont('times', 'bold')
      doc.setFontSize(16)
      doc.text('AZZA IS MAKINELERI', pageWidth / 2, 15, { align: 'center' })

      doc.setFont('times', 'normal')
      doc.setFontSize(9)
      doc.text('AYLIK HESAP EKSTRESI', pageWidth / 2, 21, { align: 'center' })

      let yPos = 35
      doc.setFont('times', 'bold')
      doc.setFontSize(10)
      doc.text(`DONEM: ${normalizeText(reportData.month).toUpperCase()}`, margin, yPos)

      doc.setFont('times', 'normal')
      doc.setFontSize(8)
      doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, pageWidth - margin, yPos, { align: 'right' })

      yPos += 10

      // Özet
      autoTable(doc, {
        startY: yPos,
        head: [['HESAP OZETI', 'TUTAR (USD)']],
        body: [
          ['Toplam Gelir (Faturalar)', `+ ${reportData.totalRevenue.toLocaleString()}`],
          ['Toplam Gider (Masraflar)', `- ${reportData.totalExpenses.toLocaleString()}`],
          ['', ''],
          ['NET KAR/ZARAR', reportData.profit >= 0 ? `+ ${reportData.profit.toLocaleString()}` : `- ${Math.abs(reportData.profit).toLocaleString()}`],
        ],
        theme: 'plain',
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          font: 'times',
          fontSize: 9,
          lineWidth: 0.5,
          lineColor: [0, 0, 0],
        },
        bodyStyles: {
          font: 'times',
          fontSize: 9,
        },
        columnStyles: {
          0: { cellWidth: 120, fontStyle: 'normal' },
          1: { cellWidth: 60, halign: 'right', fontStyle: 'bold' }
        },
        styles: {
          lineColor: [0, 0, 0],
          lineWidth: 0.3,
        },
        didParseCell: (data) => {
          if (data.row.index === 2) {
            data.cell.styles.lineWidth = 0.8
          }
          if (data.row.index === 3) {
            data.cell.styles.fillColor = [240, 240, 240]
            data.cell.styles.fontStyle = 'bold'
          }
        }
      })

      yPos = (doc as any).lastAutoTable.finalY + 10

      // İşlem Detayları
      doc.setFont('times', 'bold')
      doc.setFontSize(10)
      doc.text('ISLEM HAREKETLERI', margin, yPos)

      yPos += 5

      // Tüm işlemleri birleştir (gelir + gider)
      const allTransactions: any[] = []

      // Faturaları ekle (gelir)
      reportData.invoices.forEach(inv => {
        allTransactions.push({
          date: new Date(inv.issue_date),
          type: 'GELIR',
          description: `Proforma ${normalizeText(inv.invoice_number)} - ${normalizeText(inv.customer?.name || '')}`,
          income: Number(inv.total_amount || inv.unit_price),
          expense: 0,
          status: inv.status === 'paid' ? 'ODENDI' : inv.status === 'partial' ? 'KISMI' : 'BEKLIYOR'
        })
      })

      // Giderleri ekle
      reportData.expenses.forEach(exp => {
        allTransactions.push({
          date: new Date(exp.created_at),
          type: 'GIDER',
          description: normalizeText(exp.description),
          income: 0,
          expense: Number(exp.amount),
          status: exp.paid ? 'ODENDI' : 'BEKLIYOR'
        })
      })

      // Tarihe göre sırala
      allTransactions.sort((a, b) => a.date.getTime() - b.date.getTime())

      // Running balance hesapla
      let balance = 0
      const transactionData = allTransactions.map(tx => {
        balance += (tx.income - tx.expense)
        return [
          tx.date.toLocaleDateString('tr-TR'),
          tx.description,
          tx.income > 0 ? `+ ${tx.income.toLocaleString()}` : '',
          tx.expense > 0 ? `- ${tx.expense.toLocaleString()}` : '',
          balance.toLocaleString(),
          tx.status
        ]
      })

      autoTable(doc, {
        startY: yPos,
        head: [['TARIH', 'ACIKLAMA', 'GELIR (+)', 'GIDER (-)', 'BAKIYE', 'DURUM']],
        body: transactionData,
        foot: [[
          'DONEM SONU',
          '',
          `${reportData.totalRevenue.toLocaleString()}`,
          `${reportData.totalExpenses.toLocaleString()}`,
          `${balance.toLocaleString()}`,
          ''
        ]],
        theme: 'grid',
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          font: 'times',
          fontSize: 7,
          halign: 'center',
          lineWidth: 0.5,
          lineColor: [0, 0, 0],
        },
        bodyStyles: {
          font: 'times',
          fontSize: 7,
          textColor: [0, 0, 0],
        },
        footStyles: {
          fillColor: [220, 220, 220],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          font: 'times',
          fontSize: 8,
          lineWidth: 0.8,
          lineColor: [0, 0, 0],
        },
        columnStyles: {
          0: { cellWidth: 22, halign: 'center', fontSize: 7 },
          1: { cellWidth: 70, halign: 'left', fontSize: 7 },
          2: { cellWidth: 22, halign: 'right', fontStyle: 'bold' },
          3: { cellWidth: 22, halign: 'right' },
          4: { cellWidth: 25, halign: 'right', fontStyle: 'bold' },
          5: { cellWidth: 19, halign: 'center', fontSize: 6 }
        },
        styles: {
          lineColor: [0, 0, 0],
          lineWidth: 0.2,
          cellPadding: 1.5,
        },
        didParseCell: (data) => {
          // Gelir satırlarını vurgula
          if (data.section === 'body' && data.column.index === 2 && data.cell.raw) {
            data.cell.styles.textColor = [0, 100, 0]
          }
          // Gider satırlarını vurgula
          if (data.section === 'body' && data.column.index === 3 && data.cell.raw) {
            data.cell.styles.textColor = [139, 0, 0]
          }
        }
      })

      // Footer
      yPos = pageHeight - 25
      doc.setDrawColor(0)
      doc.setLineWidth(0.8)
      doc.line(margin, yPos, pageWidth - margin, yPos)

      yPos += 6
      doc.setFont('times', 'bold')
      doc.setFontSize(9)
      doc.text('AZZA IS MAKINELERI DERI TEKS. SAN. ve TIC. LTD. STI', margin, yPos)

      yPos += 5
      doc.setFont('times', 'normal')
      doc.setFontSize(8)
      doc.text('Adres: SUMER Mah. 27/3 Sokak No:4A Zeytinburnu/ISTANBUL', margin, yPos)

      yPos += 4
      doc.text('Tel: +905321696098 | Vergi Dairesi: Zeytinburnu V.D.', margin, yPos)

      yPos += 6
      doc.setFont('times', 'italic')
      doc.setFontSize(7)
      doc.setTextColor(100)
      doc.text('Bu ekstre elektronik olarak olusturulmustur. Mali musavir onayina tabidir.', pageWidth / 2, yPos, { align: 'center' })

      doc.save(`AZZA_Ekstre_${normalizeText(reportData.month).replace(/\s/g, '_')}.pdf`)
    } catch (error) {
      console.error('PDF olusturma hatasi:', error)
      alert('Rapor olusturulurken hata olustu!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleExport} disabled={loading} variant="outline" size="sm">
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      Ekstre İndir
    </Button>
  )
}
