export type OrderItem = {
  id: string
  ean: number
  name: string
  price: number
  quantity: number
}

export type Order = {
  id: string
  status: 'pending' | 'completed' | 'cancelled' | 'refunded' | 'shipped' | 'delivered'
  paymentId: string
  items: OrderItem[]
  total: number
  createdAt: EpochTimeStamp
  updatedAt: EpochTimeStamp
}
