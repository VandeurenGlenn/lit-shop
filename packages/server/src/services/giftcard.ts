import { create } from 'qrcode'
import { database } from '../helpers/firebase.js'

const giftcardsRef = database.ref('giftcards')

export const generateGiftcard = async ({ amount, from, to }) => {
  const giftcard = {
    amount,
    from,
    to,
    status: 'active',
    createdAt: new Date().getTime()
  }
  const snap = await giftcardsRef.push(giftcard)
  return snap.key
}
