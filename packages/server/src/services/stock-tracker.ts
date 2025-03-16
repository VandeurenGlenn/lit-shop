import { database } from '../helpers/firebase.js'

const productsRef = database.ref('products')
const cartsRef = database.ref('carts')
const carts = {}
const products = (await productsRef.get())?.val() || {}

productsRef.on('child_added', (snapshot) => {
  products[snapshot.key] = snapshot.val()
})

productsRef.on('child_changed', (snapshot) => {
  products[snapshot.key] = snapshot.val()
})

productsRef.on('child_removed', (snapshot) => {
  delete products[snapshot.key]
})

cartsRef.on('child_added', (snapshot) => {
  carts[snapshot.key] = snapshot.val()

  for (const [UID, value] of Object.entries(carts[snapshot.key])) {
    const product = products[value.key]
    for (const [key, sku] of Object.entries(product.skus)) {
      if (value.EAN === sku.EAN) {
        sku.stock
        sku.inStock -= value.amount
      }
    }
  }
})

cartsRef.on('child_changed', (snapshot) => {
  carts[snapshot.key] = snapshot.val()
})

cartsRef.on('child_removed', (snapshot) => {
  delete carts[snapshot.key]
})
