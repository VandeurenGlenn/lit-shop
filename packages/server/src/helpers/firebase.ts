import { initializeApp, cert } from 'firebase-admin/app'
import { getDatabase } from 'firebase-admin/database'
import { readFile } from 'fs/promises'
import { config } from './config.js'

const serviceAccount = JSON.parse((await readFile(config.firebase.serviceAccountKey)).toString())

const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: config.firebase.databaseURL
})

export const database = getDatabase(app)
