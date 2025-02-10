import Router from 'koa-router'
import { database } from '../../helpers/firebase.js'

const router = new Router()

const productsRef = database.ref('products')

const cache = new Map()

const cacheTime = 1000 * 60 * 60

const getProductsFromCache = async () => {
  if (cache.has('products')) {
    const { timestamp, value } = cache.get('products')
    if (Date.now() - timestamp < cacheTime) {
      return value
    }
  }

  const snap = await productsRef.get()
  cache.set('products', { timestamp: Date.now(), value: snap.val() })
  return cache.get('products').value
}

router.get('/api/products', async (ctx) => {
  ctx.body = await getProductsFromCache()
})

router.get('/api/products/:id', async (ctx) => {
  const products = await getProductsFromCache()
  ctx.body = products[ctx.params.id]
})

export default router.routes()
