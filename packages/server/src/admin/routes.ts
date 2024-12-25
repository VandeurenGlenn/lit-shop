import { getAuth } from 'firebase-admin/auth'
import { initializeApp, cert } from 'firebase-admin/app'
import { getDatabase, get, set } from 'firebase-admin/database'
import { readFile } from 'fs/promises'
import Router from 'koa-router'

const serviceAccount = JSON.parse((await readFile('./serviceAccountKey.json')).toString())

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://topveldwinkel.firebaseio.com'
})
const database = getDatabase()

const router = new Router()

router.get('/api/admin/api-keys', async (ctx) => {
  const idToken = ctx.request.headers['x-lit-shop-id']
  const decodedToken = await getAuth().verifyIdToken(idToken)

  const uid = decodedToken.uid
  const snap = await database.ref('/admins').child(uid).get()
  console.log(snap)

  ctx.body = serviceAccount.apis
})

const routes = router.routes()

export { router, routes }
