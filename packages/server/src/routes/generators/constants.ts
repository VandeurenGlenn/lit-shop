import { userInfo } from 'os'
import { open, mkdir } from 'fs/promises'
const homedir = userInfo().homedir

export const QRCODES_PATH = `${homedir}/.lit-shop/qrcodes`

try {
  await open(QRCODES_PATH)
} catch (error) {
  await mkdir(QRCODES_PATH, { recursive: true })
}
