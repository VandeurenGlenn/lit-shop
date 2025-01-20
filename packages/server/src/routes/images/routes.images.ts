import { getDatabase } from 'firebase-admin/database'
import type { Context } from 'koa'
import Router from 'koa-router'
import mime from 'mime-types'
import request from 'request'

const router = new Router()

const database = getDatabase()

const imagesRef = database.ref('images')
const images = {}

imagesRef.on('child_added', (snapshot) => {
  images[snapshot.key] = snapshot.val()
})

imagesRef.on('child_changed', (snapshot) => {
  images[snapshot.key] = snapshot.val()
})

imagesRef.on('child_removed', (snapshot) => {
  delete images[snapshot.key]
})

router.get('/api/image', async (ctx: Context) => {
  const firebaseKey = ctx.request.query.firebaseKey as string
  let imageUrl: string

  if (firebaseKey) imageUrl = images[firebaseKey]?.link

  if (!imageUrl) imageUrl = ctx.request.query.image as string

  if (imageUrl) {
    ctx.body = request(imageUrl)
    const type = mime.lookup(imageUrl)
    if (!type) {
      ctx.status = 404
      ctx.body = 'image type not found'
    } else ctx.type = type
  } else ctx.status = 404
})

export default router.routes()
