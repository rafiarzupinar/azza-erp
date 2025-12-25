import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { ProformaInvoice, ProformaInvoiceItem, BankAccount, Company } from '@/types/database'

interface ProformaData extends ProformaInvoice {
  customer: Company
  bank_account: BankAccount
  items: ProformaInvoiceItem[]
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

export async function generateProformaInvoicePDF(proforma: ProformaData) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15

  // Logo ekle
  try {
    const logoImg = await fetch('/logo.png').then(res => res.blob())
    const logoBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(logoImg)
    })
    doc.addImage(logoBase64, 'PNG', margin, 8, 30, 30)
  } catch (e) {
    console.log('Logo yuklenemedi')
  }

  // AZZA Header
  doc.setFont('times', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0)
      doc.text('AZZA IS MAKINELERI', 50, 15)
      
        doc.setFont('times', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0)
  doc.text('DERI TEKS. SAN. ve TIC. LTD. STI', 50, 21)

  doc.setFont('times', 'normal')
  doc.setFontSize(9)

  doc.text('Adres: SUMER Mah. 27/3 Sokak No:4A Zeytinburnu/IST', 50, 26)
  doc.text('Cell: +905321696098', 50, 31)

  // Date ve Invoice No
  doc.setFont('times', 'normal')
  doc.setFontSize(10)
  doc.text(`Date: ${new Date(proforma.issue_date).toLocaleDateString('en-GB')}`, pageWidth - margin, 15, { align: 'right' })
  doc.text(`Invoice No: ${normalizeText(proforma.invoice_number)}`, pageWidth - margin, 22, { align: 'right' })

  // Consignee Box
  let yPos = 45
  doc.setFont('times', 'bold')
  doc.setFontSize(10)
  doc.text('Consignee', margin, yPos)

  doc.setDrawColor(0)
  doc.setLineWidth(0.5)
  doc.rect(margin, yPos + 2, pageWidth - 2 * margin, 35)

  doc.setFont('times', 'bold')
  doc.setFontSize(10)
  doc.text(normalizeText(proforma.customer.name), margin + 3, yPos + 8)

  doc.setFont('times', 'normal')
  doc.setFontSize(9)
  let addressY = yPos + 13
  if (proforma.customer.address) {
    const addressLines = doc.splitTextToSize(normalizeText(proforma.customer.address), 160)
    addressLines.forEach((line: string, i: number) => {
      doc.text(line, margin + 3, addressY + (i * 4))
    })
    addressY += addressLines.length * 4
  }

  if (proforma.customer.country) {
    doc.text(normalizeText(proforma.customer.country), margin + 3, addressY)
    addressY += 4
  }

  if (proforma.customer.tax_number) {
    doc.text(`TAX ID: ${proforma.customer.tax_number}`, margin + 3, addressY)
    addressY += 4
  }

  if (proforma.customer.contact_person) {
    doc.text(normalizeText(proforma.customer.contact_person), margin + 3, addressY)
    addressY += 4
  }

  if (proforma.customer.email) {
    doc.text(`Email: ${proforma.customer.email}`, margin + 3, addressY)
  }

  if (proforma.customer.phone) {
    doc.text(`Phone/Whatsapp: ${proforma.customer.phone}`, margin + 3, addressY + 4)
  }

  yPos = 90

  // Makine tablosu - BIRDEN FAZLA MAKİNE
  const tableData = proforma.items.map((item, index) => {
    const portName = proforma.destination_port ? normalizeText(proforma.destination_port.split(',')[0]) : ''
    const machineDesc = `${index === 0 ? portName + '\n' : ''}USED ${normalizeText(item.machine_type).toUpperCase()}\n${normalizeText(item.brand)} ${normalizeText(item.model)}${item.year ? '\nManufacturing Year: ' + item.year : ''}`

    return [
      normalizeText(item.chassis_number),
      machineDesc,
      `${item.quantity}\nUnits`,
      `${item.unit_price.toFixed(0)}\n${proforma.currency}`,
      `${item.total_price.toFixed(0)}\n${proforma.currency}`
    ]
  })

  autoTable(doc, {
    startY: yPos,
    head: [['CHASIS NO', 'DESCRIPTION', 'QTY', 'UNIT PRICE', 'TOTAL PRICE']],
    body: tableData,
    foot: [[
      '',
      'GRAND TOTAL',
      '',
      '',
      `${proforma.total_amount?.toFixed(0) || proforma.unit_price.toFixed(0)}\n${proforma.currency}`
    ]],
    theme: 'grid',
    headStyles: {
      fillColor: [220, 220, 220],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      font: 'times',
      fontSize: 8,
      halign: 'center',
      valign: 'middle',
      cellPadding: 2,
    },
    bodyStyles: {
      font: 'times',
      fontSize: 8,
      textColor: [0, 0, 0],
      cellPadding: 2,
    },
    footStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      font: 'times',
      fontSize: 10,
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 25, halign: 'center', fontSize: 7 },
      1: { cellWidth: 93, halign: 'left', fontStyle: 'normal' },
      2: { cellWidth: 12, halign: 'center', fontSize: 8 },
      3: { cellWidth: 25, halign: 'center', fontStyle: 'normal' },
      4: { cellWidth: 25, halign: 'center', fontStyle: 'bold' }
    },
    styles: {
      lineColor: [0, 0, 0],
      lineWidth: 0.5,
      overflow: 'linebreak',
    }
  })

  yPos = (doc as any).lastAutoTable.finalY + 10

  // Terms of Payment
  doc.setFont('times', 'bold')
  doc.setFontSize(10)
  doc.text('Terms of Payment:', margin, yPos)

  doc.setFont('times', 'normal')
  doc.setFontSize(9)
  const paymentTerms = normalizeText(proforma.payment_terms || '30% deposit, 70% before delivery')
  doc.text(paymentTerms, margin + 40, yPos)

  if (proforma.deposit_amount) {
    yPos += 6
    doc.setFont('times', 'bold')
    doc.text(`Deposit Amount: ${proforma.deposit_amount.toFixed(0)} ${proforma.currency}`, margin + 40, yPos)
  }

  yPos += 10

  // BANK DETAILS
  autoTable(doc, {
    startY: yPos,
    head: [['BANK DETAILS', '']],
    body: [
      ['BANK NAME', normalizeText(proforma.bank_account.bank_name)],
      ['BANK ADRES', 'ZEYTINBURNU / ISTANBUL TURKEY'],
      ['ACCOUNT NAME', normalizeText(proforma.bank_account.account_holder)],
      ['IBAN', proforma.bank_account.iban || '-'],
      ['BRANCH', '39-ZEYTINBURNU BRANCH'],
      ['SWIFT CODE', proforma.bank_account.swift_code || '-']
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      font: 'times',
      fontSize: 10,
      halign: 'left',
    },
    bodyStyles: {
      font: 'times',
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 45, fontStyle: 'bold', fillColor: [245, 245, 245] },
      1: { cellWidth: 135, fontStyle: 'normal' }
    },
    styles: {
      lineColor: [0, 0, 0],
      lineWidth: 0.5,
    }
  })

  yPos = (doc as any).lastAutoTable.finalY + 15

  // İmza
  try {
    const signatureImg = await fetch('/signature.png').then(res => res.blob())
    const signatureBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(signatureImg)
    })
    doc.addImage(signatureBase64, 'PNG', pageWidth - 70, yPos, 50, 16)
  } catch (e) {
    console.log('Imza yuklenemedi')
  }

  // Footer
  doc.setDrawColor(0)
  doc.setLineWidth(0.5)
  doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20)

  doc.setFont('times', 'italic')
  doc.setFontSize(8)
  doc.setTextColor(80)
  doc.text('This proforma invoice is valid for 30 days from the issue date.', pageWidth / 2, pageHeight - 14, { align: 'center' })

  doc.setFont('times', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(0)
  doc.text('AZZA IS MAKINELERI DERI TEKS. SAN. ve TIC. LTD. STI', pageWidth / 2, pageHeight - 9, { align: 'center' })

  doc.setFont('times', 'normal')
  doc.setFontSize(7)
  doc.text('Heavy Machinery Import/Export - Zeytinburnu/Istanbul', pageWidth / 2, pageHeight - 5, { align: 'center' })

  doc.save(`Proforma_${normalizeText(proforma.invoice_number)}.pdf`)
}
