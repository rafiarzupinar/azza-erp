import type { MachineStatus, ShipmentStatus, PaymentStatus, ExpenseCategory, CurrencyType } from '@/types/database'

// Makine durumları
export const machineStatusLabels: Record<MachineStatus, string> = {
  available: 'Müsait',
  reserved: 'Rezerve',
  in_transit: 'Yolda',
  sold: 'Satıldı',
}

// Sevkiyat durumları
export const shipmentStatusLabels: Record<ShipmentStatus, string> = {
  pending: 'Bekliyor',
  loading: 'Yükleniyor',
  in_transit: 'Yolda',
  arrived: 'Vardı',
  delivered: 'Teslim Edildi',
}

// Ödeme durumları
export const paymentStatusLabels: Record<PaymentStatus, string> = {
  pending: 'Bekliyor',
  partial: 'Kısmi Ödendi',
  paid: 'Ödendi',
}

// Gider kategorileri
export const expenseCategoryLabels: Record<ExpenseCategory, string> = {
  transport: 'Taşıma',
  customs: 'Gümrük',
  port_fees: 'Liman Ücretleri',
  insurance: 'Sigorta',
  inspection: 'Muayene',
  storage: 'Depolama',
  other: 'Diğer',
}

// Para birimleri
export const currencyLabels: Record<CurrencyType, string> = {
  USD: 'USD ($)',
  EUR: 'EUR (€)',
  TRY: 'TRY (₺)',
}

// Badge variant helper
export function getMachineStatusVariant(status: MachineStatus): 'default' | 'secondary' | 'outline' {
  switch (status) {
    case 'available':
      return 'default'
    case 'sold':
      return 'secondary'
    default:
      return 'outline'
  }
}

export function getPaymentStatusVariant(status: PaymentStatus): 'default' | 'secondary' | 'outline' {
  switch (status) {
    case 'paid':
      return 'default'
    case 'partial':
      return 'secondary'
    default:
      return 'outline'
  }
}

export function getShipmentStatusVariant(status: ShipmentStatus): 'default' | 'secondary' | 'outline' {
  switch (status) {
    case 'delivered':
      return 'default'
    case 'in_transit':
      return 'secondary'
    default:
      return 'outline'
  }
}
