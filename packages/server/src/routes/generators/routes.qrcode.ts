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

const generateSafeName = (filename: string) => base32.encode(encoder.encode(filename))

const generateSafePath = (filename: string) => join(QRCODES_PATH, `${generateSafeName(filename)}.svg`)

const generateQR = async (text: string, path: string) =>
  qrcode.toFile(path, encodeURI(text), {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 1,
    scale: 100,
    color: {
      dark: '#fff',
      light: '#000'
    }
  })

const streamWhenPossible = async (path, ctx) => {
  const fd = await open(path)
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
  const path = generateSafePath(text)

  console.log(text)
  console.log(encodeURI(text))
  try {
    await generateQR(text, path)
    await streamWhenPossible(path, ctx)
  } catch (error) {
    console.log(error)

    ctx.status = 500
    ctx.body = error.message
  }
})

router.get('/api/has-qrcode', async (ctx: Context) => {
  const text = ctx.request.query.text as string
  const path = generateSafePath(text)
  try {
    await open(path)
    ctx.status = 200
    ctx.body = true
  } catch (error) {
    ctx.status = 200
    ctx.body = false
  }
})

router.get('/api/get-qrcode', async (ctx: Context) => {
  const text = ctx.request.query.text as string
  const path = generateSafePath(text)
  try {
    await streamWhenPossible(path, ctx)
    // ctx.body =
  } catch (error) {
    try {
      await generateQR(text, path)
      await streamWhenPossible(path, ctx)
    } catch (error) {
      ctx.status = 500
      ctx.body = error.message
    }
  }
})

export default router.routes()
