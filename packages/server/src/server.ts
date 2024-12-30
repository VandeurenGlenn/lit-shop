import Koa, { Context } from 'koa'
import koaStatic from 'koa-static'
import koaCompress from 'koa-compress'
import { DataSnapshot } from '@firebase/database-types'
import { constants } from 'zlib'

import { readFile } from 'fs/promises'
import { initializeApp, cert } from 'firebase-admin/app'
import { getDatabase } from 'firebase-admin/database'

const config = JSON.parse((await readFile('./server.config.json')).toString())

const serviceAccount = JSON.parse((await readFile('./serviceAccountKey.json')).toString())

const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://hello-new-me-default-rtdb.europe-west1.firebasedatabase.app'
})

const database = getDatabase(app)

const server = new Koa()

if (config.services?.checkout) {
  for (const [service, enabled] of Object.entries(config.services.checkout)) {
    if (enabled) {
      const snap = await database.ref(`apiKeys/${service}`).get()
      const apiKey = snap.val()
      if (apiKey) {
        console.log(`API key found for service ${service}`)
        console.log(`setting up routes for service ${service}`)
        const routes = (await import(`./routes.${service}.js`)).default

        server.use(routes)
      } else {
        console.warn(
          `No API key found for service ${service} in database \n disable service in server.config.json to remove this warning \n or add the API key to the database under the path "apiKeys/${service}"`
        )
        console.warn(`ignoring service ${service}`)
      }
    }
  }
}

if (config.services.images) {
  const routes = (await import(`./routes.images.js`)).default
  server.use(routes)
  // just a check for now, all images are handled by the same route
  for (const service of Object.keys(config.services.images)) {
    const snap = await database.ref(`apiKeys/${service}`).get()
    const apiKey = snap.val()
    if (apiKey) {
      console.log(`API key found for service ${service}`)
      console.log(`setting up routes for service ${service}`)
    } else {
      console.warn(
        `No API key found for service ${service} in database \n disable service in server.config.json to remove this warning \n or add the API key to the database under the path "apiKeys/${service}"`
      )
      console.warn(`ignoring service ${service}`)
    }
  }
}

server.use(
  koaCompress({
    filter(content_type) {
      return /text|application\/javascript/i.test(content_type)
    },
    threshold: 2048,
    gzip: {
      flush: constants.Z_SYNC_FLUSH
    },
    deflate: {
      flush: constants.Z_SYNC_FLUSH
    },
    br: false // disable brotli
  })
)
server.use(koaStatic('./../admin/www'))

server.listen(3005)
