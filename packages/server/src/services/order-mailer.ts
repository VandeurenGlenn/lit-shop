import { database } from '../helpers/firebase.js'

database.ref('transactions').on('child_changed', async (snap) => {
  const transaction = snap.val()
  if (transaction.status === 'SUCCEEDED') {
    const snap = await database.ref('orders').child(transaction.orderId).get()
    const order = snap.val()
    if (!order) {
      console.error('order not found')
      return
    }
    await database.ref('orders').child(transaction.orderId).update({ status: 'PAID' })
  }
})
