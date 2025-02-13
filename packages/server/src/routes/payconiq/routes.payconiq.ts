import Router from 'koa-router'
import { API_URL, CALLBACK_URL, CANCEL_PAYMENT, CREATE_PAYMENT } from './constants.js'
import { database } from '../../helpers/firebase.js'
import { PayconiqTransaction } from '@lit-shop/types'

const router = new Router()

const payconiqTransactionsRef = database.ref('payconiqTransactions')

const giftcardsRef = database.ref('giftcards')

const transactionsRef = database.ref('transactions')

export type PayconiqPaymentStatus =
  | 'PENDING'
  | 'IDENTIFIED'
  | 'CANCELLED'
  | 'AUTHORIZED'
  | 'AUTHORIZATION_FAILED'
  | 'EXPIRED'
  | 'FAILED'
  | 'SUCCEEDED'

export type PayconiqCallbackUrlBody = {
  paymentId: string
  transferAmount: number
  tippingAmount: number
  amount: number
  totalAmount: number
  description: string
  createdAt: string
  expireAt: string
  status: PayconiqPaymentStatus
}

const snap = await database.ref('apiKeys/payconiq').get()
const PAYCONIQ_API_KEY = snap.val()

const generateHeaders = () => {
  const headers = new Headers()
  headers.set('Authorization', `Bearer ${PAYCONIQ_API_KEY}`)
  headers.set('Cache-Control', 'no-cache')
  headers.set('Content-Type', 'application/json')
  return headers
}

router.post(CREATE_PAYMENT, async (ctx) => {
  const headers = generateHeaders()
  const { amount, description, giftcards, orderId } = ctx.request.body
  let transactionAmount = Number(amount)

  if (!amount || !description || !orderId) ctx.body = 'invalid request'
  console.log('giftcards', giftcards)
  console.log('amount', amount)
  console.log('description', description)

  // check for gitcards and substract their amount from the transaction amount
  if (giftcards && giftcards.length > 0) {
    try {
      for (const giftcardId of giftcards) {
        const snap = await giftcardsRef.child(giftcardId).get()

        if (!snap.exists()) {
          ctx.body = 'giftcard not found'
          return
        }

        const giftcard = snap.val()

        if (giftcard.status !== 'active') {
          ctx.body = 'giftcard not redeemable'
          return
        }
        giftcardsRef.child(giftcardId).update({ status: 'pending' })
        transactionAmount -= Number(giftcard.amount)
      }
    } catch (error) {
      console.error(error)
      ctx.status = 500
      ctx.body = error.message
    }
  } else {
    try {
      const body = JSON.stringify({
        amount: transactionAmount * 100,
        currency: 'EUR',
        description,
        callbackUrl: CALLBACK_URL
      })
      console.log('body', body)

      const _response = await fetch(API_URL, { headers, body, method: 'POST' })
      const payment = await _response.json()
      console.log('payment', payment)
      const firebaseTransaction = {
        type: 'payconiq',
        paymentId: payment.paymentId,
        amount: transactionAmount,
        status: payment.status,
        giftcards: giftcards || []
      }
      const snap = transactionsRef.push(firebaseTransaction)

      const _payconiqTransaction: PayconiqTransaction = {
        transactionId: snap.key,
        paymentId: payment.paymentId,
        amount: transactionAmount,
        status: payment.status
      }

      payconiqTransactionsRef.child(payment.paymentId).set(_payconiqTransaction)
      ctx.body = payment
    } catch (error) {
      console.error(error)
      ctx.status = 500
      ctx.body = error.message
    }
    // payment.paymentId
  }
})

router.get(CANCEL_PAYMENT, async (ctx) => {
  const headers = generateHeaders()
  const { payment } = ctx.query

  if (!payment) ctx.body = 'invalid cancel request'
  else {
    const _response = await fetch(`https://api.payconiq.com/v3/payments/${payment}`, { headers, method: 'DELETE' })
    ctx.body = await _response.text()
  }
})

router.post('/checkout/payconiq/callbackUrl', async (ctx) => {
  const payment = ctx.request.body as PayconiqCallbackUrlBody
  const ref = payconiqTransactionsRef.child(payment.paymentId)

  const payconiqTransaction = (await ref.get()).val() as PayconiqTransaction

  const txRef = transactionsRef.child(payconiqTransaction.transactionId)

  const firebaseTransaction = (await txRef.get()).val()

  if (payment.status !== 'PENDING' && payment.status !== 'AUTHORIZED' && payment.status !== 'IDENTIFIED') {
    await ref.update({ status: payment.status })
    setTimeout(async () => {
      await ref.remove()
      if (payment.status === 'SUCCEEDED') {
        await txRef.update({ status: 'SUCCEEDED' })
        if (firebaseTransaction.giftcards) {
          for (const giftcardId of firebaseTransaction.giftcards) {
            const snap = await giftcardsRef.child(giftcardId).get()
            if (!snap.exists()) {
              console.error('giftcard not found')
              return
            }
            await giftcardsRef.child(giftcardId).update({
              status: 'redeemed',
              updatedAt: Date.now(),
              redeemedAt: Date.now()
            })
          }
        }
        const snap = await database.ref('orders').child(firebaseTransaction.orderId).get()
        const order = snap.val()
        if (order.giftcards) {
          for (const giftcardId of order.giftcards) {
            await giftcardsRef
              .child(giftcardId)
              .update({ status: 'redeemed', updatedAt: Date.now(), redeemedAt: Date.now() })
          }
        }
      } else {
        if (firebaseTransaction.giftcards) {
          for (const giftcardId of firebaseTransaction.giftcards) {
            await giftcardsRef.child(giftcardId).update({ status: 'active', updatedAt: Date.now(), redeemedAt: null })
          }
        }
        await txRef.remove()
      }
    }, 5000)
  } else {
    await ref.update({ status: payment.status })
  }
  ctx.status = 200
  ctx.body = 'ok'
})

export default router.routes()
