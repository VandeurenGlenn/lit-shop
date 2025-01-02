export type GiftcardStatus = 'active' | 'redeemed' | 'expired' | 'pending'

export type PaymentType = 'payconiq' | 'bancontact' | 'creditcard' | 'paypal' | 'giftcard' | 'cash'

export type Giftcard = {
  amount: string
  status: GiftcardStatus
  redeemedAt: number | null // date redeemed
  redeemBy: string
  createdAt: EpochTimeStamp
  updatedAt: EpochTimeStamp
  paymentType: PaymentType | null
  paymentId: string | null
  uuid: string
}
