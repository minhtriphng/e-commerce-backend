export enum Status {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}
export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  TIEN_MAT = 'tien-mat',
  MOMO = 'momo',
  BANK = 'bank',
  VNPAY = 'vnpay',
}
