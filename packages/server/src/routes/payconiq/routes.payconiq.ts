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

// remove ext when production
const apiURL = `https://api.payconiq.com/v3/payments`

payconiqTransactionsRef.on('child_changed', async (snap) => {
  const payconiqTransaction = snap.val()
  transactionsRef.child(payconiqTransaction.transactionId).update({ status: payconiqTransaction.status })
  if (
    payconiqTransaction.status === 'CANCELLED' ||
    payconiqTransaction.status === 'FAILED' ||
    payconiqTransaction.status === 'EXPIRED'
  ) {
    // whenever a giftcard is used in a transaction, it should be set to inactive
    // but we should also check if the transaction was cancelled or failed
    // if it was, we should set the giftcard to active again
    if (payconiqTransaction.giftcards) {
      for (const giftcardId of payconiqTransaction.giftcards) {
        await giftcardsRef.child(giftcardId).update({ status: 'active', updatedAt: Date.now(), redeemedAt: null })
      }
    }
  } else if (payconiqTransaction.status === 'SUCCEEDED') {
    // if the transaction was successful, we should set the giftcard to redeemed
    if (payconiqTransaction.giftcards) {
      for (const giftcardId of payconiqTransaction.giftcards) {
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
  }
})

const generateHeaders = () => {
  const headers = new Headers()
  headers.set('Authorization', `Bearer ${PAYCONIQ_API_KEY}`)
  headers.set('Cache-Control', 'no-cache')
  headers.set('Content-Type', 'application/json')
  return headers
}

router.get(CREATE_PAYMENT, async (ctx) => {
  const headers = generateHeaders()
  const { amount, description, giftcards, items } = ctx.query
  let transactionAmount = Number(amount)

  if (!amount || !description || !items) ctx.body = 'invalid request'
  // check for gitcards and substract their amount from the transaction amount
  if (giftcards) {
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
      const _response = await fetch(apiURL, { headers, body, method: 'POST' })
      const payment = await _response.json()

      const snap = transactionsRef.push({ payment, items, giftcards, amount })
      payment.transactionId = snap.key
      payconiqTransactionsRef.child(payment.paymentId).set(payment)
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
    const _response = await fetch(payment as string, { headers, method: 'DELETE' })
    ctx.body = await _response.text()
  }
})

router.post(CALLBACK_URL, async (ctx) => {
  const payment = ctx.body as PayconiqCallbackUrlBody
  const ref = payconiqTransactionsRef.child(payment.paymentId)
  if (payment.status !== 'PENDING' && payment.status !== 'AUTHORIZED' && payment.status !== 'IDENTIFIED') {
    await ref.update({ status: payment.status })
    setTimeout(async () => {
      await ref.remove()
    }, 5000)
  } else {
    await ref.update({ status: payment.status })
  }
  ctx.status = 200
  ctx.body = 'ok'
})

export default router.routes()
