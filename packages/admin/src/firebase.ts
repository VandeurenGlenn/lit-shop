// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  signOut,
  sendSignInLinkToEmail as _sendSignInLinkToEmail,
  signInWithEmailAndPassword as _signInWithEmailAndPassword,
  isSignInWithEmailLink as _isSignInWithEmailLink,
  signInWithEmailLink as _signInWithEmailLink,
  updatePassword as _updatePassword
} from 'firebase/auth'
import {
  get as _get,
  push as _push,
  set as _set,
  remove as _remove,
  update as _update,
  getDatabase,
  ref,
  query as _query,
  onValue,
  limitToLast as _limitToLast,
  onChildAdded as _onChildAdded,
  onChildRemoved as _onChildRemoved,
  onChildChanged as _onChildChanged
} from 'firebase/database'
import { getStorage, ref as fileref, uploadBytes as _uploadBytes, getDownloadURL } from 'firebase/storage'
const firebaseConfig = {
  apiKey: 'AIzaSyASfmIWBP0bBdwd3uIWT9cxkaTV6DsncZE',
  authDomain: 'poho-app-8dce1.firebaseapp.com',
  projectId: 'poho-app',
  storageBucket: 'poho-app.appspot.com',
  messagingSenderId: '878719433981',
  appId: '1:878719433981:web:8bbc0d0bb355da551b9294',
  measurementId: 'G-7C3T5W3P3D',
  databaseURL: 'https://poho-app-default-rtdb.europe-west1.firebasedatabase.app/'
}

export type FirebaseDatabaseFormat = object | any[] | number | string | boolean

// Initialize Firebase
const app = initializeApp(firebaseConfig)

const database = getDatabase()
const storage = getStorage()

const uploadBytes = (path, data) => _uploadBytes(fileref(storage, path), data)

const get = async (path: string): Promise<FirebaseDatabaseFormat> => {
  const snap = await _get(ref(database, path))
  return snap.val()
}

const push = async (path: string, value: FirebaseDatabaseFormat): Promise<string> => {
  const snap = await _push(ref(database, path), value)
  return snap.key
}
const set = async (path: string, value: FirebaseDatabaseFormat) => _set(ref(database, path), value)

const remove = async (path: string): Promise<void> => _remove(ref(database, path))

const update = async (path: string, value: any): Promise<void> => _update(ref(database, path), value)

const signInWithEmailAndPassword = (email, password) => _signInWithEmailAndPassword(auth, email, password)

const login = async () => {}

const logout = async () => {}

let userDetails
let userRoles
let userDefaultPage

let isUserReady

const userReady = new Promise((resolve) => (isUserReady = resolve))

const auth = await getAuth(app)

const onChildAdded = (target, cb) => {
  _onChildAdded(ref(database, target), cb)
}
const onChildRemoved = (target, cb) => {
  _onChildRemoved(ref(database, target), cb)
}

const onChildChanged = (target, cb) => {
  _onChildChanged(ref(database, target), cb)
}

const actionCodeSettings = {
  url: 'https://pohoapp.web.app/index.html',
  handleCodeInApp: true
}

const sendSignInLinkToEmail = (email) => _sendSignInLinkToEmail(auth, email, actionCodeSettings)
const isSignInWithEmailLink = (link) => _isSignInWithEmailLink(auth, link)
const signInWithEmailLink = (email, link) => _signInWithEmailLink(auth, email, link)
const updatePassword = (password) => _updatePassword(auth.currentUser, password)

const limitToLast = (target: string, amount: number = 1, cb) => {
  const dbQ = _query(ref(database, target), _limitToLast(amount))
  onValue(dbQ, (snapshot) => cb(snapshot), { onlyOnce: false })
}

const _firebase = {
  get,
  push,
  set,
  userDetails,
  userRoles,
  userDefaultPage,
  remove,
  update,
  auth,
  login,
  logout,
  onChildAdded,
  onChildRemoved,
  onChildChanged,
  uploadBytes,
  getDownloadURL,
  isSignInWithEmailLink,
  signInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  updatePassword,
  limitToLast,
  userReady,
  signOut: () => signOut(auth)
}

globalThis.firebase = _firebase
declare global {
  var firebase: typeof _firebase
}
export default _firebase
