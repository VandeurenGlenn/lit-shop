import type { Context } from 'koa'
import Router from 'koa-router'
import mime from 'mime-types'
import qrcode from 'qrcode'
import { open } from 'fs/promises'
import { QRCODES_PATH } from './constants.js'
import { join } from 'path'
import base32 from '@vandeurenglenn/base32'

const router = new Router()

const encoder = new TextEncoder()

const generateSafePath = (path: string) => base32.encode(encoder.encode(path))

const streamWhenPossible = async (path, ctx) => {
  const safePath = generateSafePath(path)
  const fd = await open(safePath)
  ctx.status = 200
  ctx.type = mime.lookup(path) || 'application/octet-stream'
  const stream = fd.createReadStream({ autoClose: true })
  stream.on('end', () => {
    fd.close()
  })
  ctx.body = stream
}

router.get('/api/generate-qrcode', async (ctx: Context) => {
  const text = ctx.request.query.text as string

  const path = join(QRCODES_PATH, `${text}.svg`)
  const safePath = generateSafePath(path)

  try {
    await qrcode.toFile(safePath, text, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 1,
      scale: 100,
      color: {
        dark: '#fff',
        light: '#000'
      }
    })
    await streamWhenPossible(path, ctx)
  } catch (error) {
    console.log(error)

    ctx.status = 500
    ctx.body = error.message
  }
})

router.get('/api/has-qrcode', async (ctx: Context) => {
  const text = ctx.request.query.text as string
  try {
    await open(join(QRCODES_PATH, `${text}.svg`))
    ctx.status = 200
    ctx.body = true
  } catch (error) {
    ctx.status = 200
    ctx.body = false
  }
})

router.get('/api/get-qrcode', async (ctx: Context) => {
  const text = ctx.request.query.text as string
  const path = join(QRCODES_PATH, `${text}.svg`)
  try {
    await streamWhenPossible(path, ctx)
    // ctx.body =
  } catch (error) {
    try {
      await qrcode.toFile(join(QRCODES_PATH, `${text}.svg`), text, {
        type: 'svg',
        errorCorrectionLevel: 'H',
        margin: 1,
        scale: 10,
        color: {
          dark: '#fff',
          light: '#000'
        }
      })
      await streamWhenPossible(path, ctx)
    } catch (error) {
      ctx.status = 500
      ctx.body = error.message
    }
  }
})

export default router.routes()
