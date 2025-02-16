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

  const createdAt = Date.now()

  let totalAmount = 0
  let totalItems = 0

  for (const [key, item] of Object.entries(items)) {
    totalAmount += item.price * item.amount
    totalItems += item.amount
  }

  const order = await ordersRef.push({ user, shipping, items, status: 'PENDING', createdAt, totalAmount, totalItems })
  await database
    .ref(`users/${user}/orders`)
    .child(order.key)
    .set({ status: 'PENDING', createdAt, totalAmount, totalItems })
  ctx.body = order.key
  return
})

export default router.routes()
