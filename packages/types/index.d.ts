export type UnitOfMeasurement = 'kg' | 'g' | 'mg' | 'l' | 'ml' | 'cl' | 'dl' // kg, g, mg, l, ml, cl, dl, unit, pcs

export type Product = {
  uniqueId: string
  name: string
  description: string
  category: string
  tags?: string
  public: string
  stock: number
  position: number
  sizes: { price: number; stock: number; sku: string; size: number; unit: UnitOfMeasurement; barcode: number }[]
}

export type Settings = {
  currency: string
  tax: number
  shipping: number
  currencySymbol: string
}
