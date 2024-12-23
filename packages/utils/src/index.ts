import { v4 as uuidv4, v5 as uuidv5 } from 'uuid'

/**
 * UUID is a string that is unique for every instance.
 * it is used to identify a specific instance.
 * it exists out of the v4(random) and namspace(HNM)
 */
export type UUID = string

export const generateUUID = () => uuidv4()

export function generateSKU(category: string, size: string, uniqueId: string): string {
  return `HNM-${category.slice(0, 4)}-${size}-${uniqueId}`.toUpperCase()
}

// Example usage
const sku = generateSKU('SHAMPOO', '1L', '1')
console.log(sku) // HNM-SHAMPOO-1L-1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4c1f
