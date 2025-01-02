import { initializeApp, cert } from 'firebase-admin/app'
import { getDatabase } from 'firebase-admin/database'
import { readFile } from 'fs/promises'
import Router from 'koa-router'

const config = JSON.parse((await readFile('./server.config.json')).toString())

const serviceAccount = JSON.parse((await readFile(config.firebase.serviceAccountKey)).toString())

const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: config.firebase.databaseURL
})
const database = getDatabase(app)

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
