import Koa, { Context } from 'koa'
import koaStatic from 'koa-static'
import koaCompress from 'koa-compress'
import Router from 'koa-router'
import { initializeApp } from 'firebase/app'
import { DataSnapshot } from '@firebase/database-types'
import { getDatabase, ref, onValue as _onValue, get, set } from 'firebase/database'
import mime from 'mime-types'
import request from 'request'
import { routes as adminRoutes } from './admin/routes.js'
import { constants } from 'zlib'

const firebaseConfig = {
  apiKey: 'AIzaSyAUTqcR0LQMOP1wQk3yh4x4QIaMAe6KSuQ',
  authDomain: 'hello-new-me.firebaseapp.com',
  databaseURL: 'https://hello-new-me-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'hello-new-me',
  storageBucket: 'hello-new-me.firebasestorage.app',
  messagingSenderId: '108028336132',
  appId: '1:108028336132:web:d49e8ec6020408c77cfd51',
  measurementId: 'G-3SJ2QVZH3T'
}

const app = initializeApp(firebaseConfig)

const database = getDatabase(app)

const productsRef = ref(database, '/products')

const categoriesRef = ref(database, '/categories')

const onValue = (ref, callback) => {
  _onValue(ref, (snapshot) => callback)
}

const transformProducts = (products) => {
  for (const key of Object.keys(products)) {
    products[key].key = key
  }
  return products
}

const CACHE_TIME = 30000

const cache = new Map()

const getProducts = async () => {
  if (cache.has('products') && cache.get('products').timestamp + CACHE_TIME > new Date().getTime()) {
    console.log('from cache')

    return cache.get('products').value
  }
  const items = await (await get(productsRef)).val()

  if (!items) return []
  cache.set('products', {
    value: transformProducts(items),
    timestamp: new Date().getTime()
  })
  console.log('fresh')

  return items
}

const getCategories = async () => {
  if (cache.has('categories') && cache.get('categories').timestamp + CACHE_TIME > new Date().getTime()) {
    console.log('from cache')

    return cache.get('categories').value
  }
  const items = (await (await get(categoriesRef)).val()) || []

  cache.set('categories', {
    value: items,
    timestamp: new Date().getTime()
  })
  console.log('fresh')

  return items
}

const router = new Router()

router.get('/api/image', async (ctx: Context) => {
  console.log('request')

  // @ts-ignore
  if (ctx.request.query.image) {
    ctx.body = request(ctx.request.query.image)
    ctx.type = mime.lookup(ctx.request.query.image as string) as string
  } else ctx.status = 404
})

router.get('/api/categories', async (ctx) => {
  ctx.body = await getCategories()
})

router.get('/api/products', async (ctx) => {
  ctx.body = await getProducts()
})

router.get('/api/admin/images', async (ctx) => {
  ctx.body = await getProducts()
})

const routes = router.routes()

const server = new Koa()
server.use(
  koaCompress({
    filter(content_type) {
      console.log(content_type)
      console.log(/text|application\/javascript/i.test(content_type))

      return /text|application\/javascript/i.test(content_type)
    },
    threshold: 2048,
    gzip: {
      flush: constants.Z_SYNC_FLUSH
    },
    deflate: {
      flush: constants.Z_SYNC_FLUSH
    },
    br: false // disable brotli
  })
)
server.use(koaStatic('./../admin/www'))
server.use(routes)
server.use(adminRoutes)
server.listen(3005)
