import type { Context } from 'koa'
import Router from 'koa-router'
import { database } from '../../helpers/firebase.js'
import { create } from 'qrcode'

const router = new Router()

const ordersRef = database.ref('orders')

router.post('/orders/create', async (ctx: Context) => {
  console.log('creating order')
  console.log(ctx.request.body)
  const items = ctx.request.body.items
  const user = ctx.request.body.user
  const shipping = ctx.request.body.shipping

  if (!items || !user) {
    ctx.status = 400
    ctx.body = 'invalid request'
    return
  }

  const order = await ordersRef.push({ user, shipping, items, status: 'PENDING', createdAt: Date.now() })
  await database.ref(`users/${user}/orders`).child(order.key).set(order.key)
  ctx.body = order.key
  return
})

export default router.routes()
