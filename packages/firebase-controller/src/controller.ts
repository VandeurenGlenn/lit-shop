import { getAuth } from 'firebase/auth'
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAgSXxNo6LSsBHxa4El3MWbPjqfDgcD0h0",
  authDomain: "topveldwinkel.firebaseapp.com",
  databaseURL: "https://topveldwinkel.firebaseio.com",
  projectId: "topveldwinkel",
  appId: "1:467877680173:web:1781bc21aadaef72"
}

class Controller {
  auth
  app
  database

  constructor() {
    this.app = initializeApp(firebaseConfig)
    this.auth = getAuth()
    this.auth.useDeviceLanguage();
    this.database = getDatabase(this.app)
  }
}

const controller = new Controller()

export { controller, Controller }