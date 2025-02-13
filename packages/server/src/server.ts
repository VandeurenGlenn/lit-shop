import Koa, { Context } from 'koa'
import koaStatic from 'koa-static'
import koaCompress from 'koa-compress'
import { constants } from 'zlib'
import { readFile } from 'fs/promises'
import routes from './routes/catalog/routes.products.js'
import cors from '@koa/cors'
import { database } from './helpers/firebase.js'
import ora from 'ora'
import { bodyParser } from '@koa/bodyparser'

const spinner = ora('Loading server').start()

const config = JSON.parse((await readFile('./server.config.json')).toString())

const server = new Koa()

server.use(cors('*'))

server.use(bodyParser())

server.use(routes)

if (config.services?.checkout) {
  for (const [service, enabled] of Object.entries(config.services.checkout)) {
    if (enabled) {
      spinner.text = `setting up routes for service ${service}`
      const snap = await database.ref(`apiKeys/${service}`).get()
      const apiKey = snap.val()
      if (apiKey) {
        const routes = (await import(`./routes.${service}.js`)).default

        server.use(routes)
        spinner.succeed(`routes for service ${service} set up`)
      } else {
        spinner.info(
          `No API key found for service ${service} in database \n disable service in server.config.json to remove this warning \n or add the API key to the database under the path "apiKeys/${service}"`
        )
        spinner.warn(`ignoring service ${service}`)
      }
    }
  }
}

if (config.services.images) {
  const routes = (await import(`./routes.images.js`)).default
  server.use(routes)
  // just a check for now, all images are handled by the same route
  // for (const service of Object.keys(config.services.images)) {
  //   const snap = await database.ref(`apiKeys/${service}`).get()
  //   const apiKey = snap.val()
  //   if (apiKey) {
  //     spinner.text = `setting up routes for service ${service}`
  //   } else {
  //     console.warn(
  //       `No API key found for service ${service} in database \n disable service in server.config.json to remove this warning \n or add the API key to the database under the path "apiKeys/${service}"`
  //     )
  //     console.warn(`ignoring service ${service}`)
  //   }
  // }
}

if (config.orders) {
  const routes = (await import(`./routes.orders.js`)).default
  server.use(routes)
}

if (config.services.generators) {
  for (const [service, enabled] of Object.entries(config.services.generators)) {
    if (enabled) {
      spinner.text = `setting up routes for service ${service}`
      const routes = (await import(`./routes.${service}.js`)).default

      server.use(routes)
      spinner.succeed(`routes for service ${service} set up`)
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
