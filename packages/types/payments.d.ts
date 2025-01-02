export type Payment = {
  id: string
  amount: number
  status: 'pending' | 'completed' | 'cancelled' | 'refunded'
  paymentId: string
  createdAt: EpochTimeStamp
  updatedAt: EpochTimeStamp
  transactionType: 'payconiq' | 'bancontact' | 'creditcard' | 'paypal' | 'giftcard'
  transactionId: string // transaction id from payment provider,
  //this is the id that is used to check the status of the payment
  //will be the giftcard id if the transactionType is giftcard etc ....
}
