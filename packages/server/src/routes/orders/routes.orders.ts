import type { Context } from 'koa'
import Router from 'koa-router'
import { database } from '../../helpers/firebase.js'

const router = new Router()

const ordersRef = database.ref('orders')

router.post('/orders/create', async (ctx: Context) => {
  const items = ctx.request.body.items
  const user = ctx.request.body.user
  const shipping = ctx.request.body.shipping

  if (!items || !user) {
    ctx.status = 400
    ctx.body = 'invalid request'
    return
  }

  const order = await ordersRef.push({ user, shipping, items, status: 'PENDING' })
  ctx.body = order.key
})

export default router.routes()
