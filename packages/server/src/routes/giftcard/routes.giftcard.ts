import { initializeApp, cert } from 'firebase-admin/app'
import { getDatabase } from 'firebase-admin/database'
import { readFile } from 'fs/promises'
import Router from 'koa-router'
import { CALLBACK_URL, CANCEL_PAYMENT, CREATE_PAYMENT } from './constants.js'

const config = JSON.parse((await readFile('./server.config.json')).toString())

const serviceAccount = JSON.parse((await readFile(config.firebase.serviceAccountKey)).toString())

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: config.firebase.databaseURL
})
const database = getDatabase()

const router = new Router()

const giftcardsRef = database.ref('giftcards')

// router.get(CREATE_PAYMENT, async (ctx) => {
//   const { amount, description } = ctx.query

//   if (!amount || !description) ctx.body = 'invalid request'
//   else {
//     const body = JSON.stringify({
//       amount: Number(amount) * 100,
//       currency: 'EUR',
//       description,
//       callbackUrl: CALLBACK_URL
//     })
//     const _response = await fetch(apiURL, { headers, body, method: 'POST' })
//     const payment = await _response.json()
//     ctx.body = payment
//   }
// })

// router.get(CANCEL_PAYMENT, async (ctx) => {
//   const headers = generateHeaders()
//   const { payment } = ctx.query

//   if (!payment) ctx.body = 'invalid cancel request'
//   else {
//     const _response = await fetch(payment as string, { headers, method: 'DELETE' })
//     ctx.body = await _response.text()
//   }
// })

// router.post(CALLBACK_URL, async (ctx) => {
//   const payment = ctx.request.body as PayconiqCallbackUrlBody
//   const ref = payconiqTransactionsRef.child(payment.paymentId)
//   if (payment.status !== 'PENDING' && payment.status !== 'AUTHORIZED' && payment.status !== 'IDENTIFIED') {
//     await ref.update({ status: payment.status })
//     setTimeout(async () => {
//       await ref.remove()
//     }, 5000)
//   } else {
//     await ref.update({ status: payment.status })
//   }
//   ctx.status = 200
//   ctx.body = 'ok'
// })

export default router.routes()