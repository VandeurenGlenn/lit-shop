export type UnitOfMeasurement = 'kg' | 'g' | 'mg' | 'l' | 'ml' | 'cl' | 'dl' | 'pc' | 'pcs'

export type SKU = {
  EAN: string
  amount: number
  unit: UnitOfMeasurement
  price: number
  stock: number
  sku: string
}

export type Product = {
  uniqueId: string
  name: string
  description: string
  category: string
  tags?: string
  public: string
  stock: number
  position: number
  SKUs: SKU[]
  changedAt: number
  createdAt: number
}

export type Settings = {
  currency: string
  tax: number
  shipping: number
  currencySymbol: string
}
