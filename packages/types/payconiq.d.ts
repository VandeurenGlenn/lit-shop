export type PayconiqPaymentLink = {
  href: string
}

export type PayConiqPaymentStatus =
  | 'PENDING'
  | 'IDENTIFIED'
  | 'CANCELLED'
  | 'AUTHORIZED'
  | 'AUTHORIZATION_FAILED'
  | 'EXPIRED'
  | 'FAILED'
  | 'SUCCEEDED'

export type PayconiqPayment = {
  amount: number
  createdAt: string
  creditor: { profileId: string; merchantId: string; name: string; iban: string }
  currency: string
  description: string
  expiresAt: string
  paymentId: string
  status: PayConiqPaymentStatus
  _links: {
    cancel: PayconiqPaymentLink
    deeplink: PayconiqPaymentLink
    qrcode: PayconiqPaymentLink
    self: PayconiqPaymentLink
  }
}

export type PayconiqTransaction = {
  transactionId: string
  amount: number
  paymentId: string
  status: PayConiqPaymentStatus
}
