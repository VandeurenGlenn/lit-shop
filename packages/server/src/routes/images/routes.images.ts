import type { Context } from 'koa'
import Router from 'koa-router'
import mime from 'mime-types'
import request from 'request'

const router = new Router()

router.get('/api/image', async (ctx: Context) => {
  const imageUrl = ctx.request.query.image as string
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
