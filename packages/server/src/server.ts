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
  apiKey: 'AIzaSyAgSXxNo6LSsBHxa4El3MWbPjqfDgcD0h0',
  authDomain: 'topveldwinkel.firebaseapp.com',
  databaseURL: 'https://topveldwinkel.firebaseio.com',
  projectId: 'topveldwinkel',
  storageBucket: 'topveldwinkel.appspot.com',
  messagingSenderId: '467877680173',
  appId: '1:467877680173:web:1781bc21aadaef72'
}

const app = initializeApp(firebaseConfig)

const database = getDatabase(app)

const offersRef = ref(database, '/offers')

const categoriesRef = ref(database, '/categories')

const onValue = (ref, callback) => {
  _onValue(ref, (snapshot) => callback)
}

const transformOffers = (offers) => {
  for (const key of Object.keys(offers)) {
    offers[key].key = key
  }
  return offers
}

const CACHE_TIME = 30000

const cache = new Map()

const getOffers = async () => {
  if (cache.has('offers') && cache.get('offers').timestamp + CACHE_TIME > new Date().getTime()) {
    console.log('from cache')

    return cache.get('offers').value
  }
  const items = await (await get(offersRef)).val()

  cache.set('offers', {
    value: transformOffers(items),
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
    value: transformOffers(items),
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

router.get('/api/offers', async (ctx) => {
  ctx.body = await getOffers()
})

router.get('/api/admin/images', async (ctx) => {
  ctx.body = await getOffers()
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
