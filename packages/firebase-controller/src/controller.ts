import { getAuth } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyAUTqcR0LQMOP1wQk3yh4x4QIaMAe6KSuQ',
  authDomain: 'hello-new-me.firebaseapp.com',
  databaseURL: 'https://hello-new-me-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'hello-new-me',
  storageBucket: 'hello-new-me.firebasestorage.app',
  messagingSenderId: '108028336132',
  appId: '1:108028336132:web:d49e8ec6020408c77cfd51',
  measurementId: 'G-3SJ2QVZH3T'
}

class Controller {
  auth
  app
  database

  constructor() {
    this.app = initializeApp(firebaseConfig)
    this.auth = getAuth()
    this.auth.useDeviceLanguage()
    this.database = getDatabase(this.app)
  }
}

const controller = new Controller()

export { controller, Controller }
