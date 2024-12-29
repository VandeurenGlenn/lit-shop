// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  signOut,
  sendSignInLinkToEmail as _sendSignInLinkToEmail,
  signInWithEmailAndPassword as _signInWithEmailAndPassword,
  isSignInWithEmailLink as _isSignInWithEmailLink,
  signInWithEmailLink as _signInWithEmailLink,
  updatePassword as _updatePassword,
  User,
  signInWithPopup as _signInWithPopup,
  GoogleAuthProvider,
  getRedirectResult
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
  apiKey: 'AIzaSyAUTqcR0LQMOP1wQk3yh4x4QIaMAe6KSuQ',
  authDomain: 'hello-new-me.firebaseapp.com',
  databaseURL: 'https://hello-new-me-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'hello-new-me',
  storageBucket: 'hello-new-me.firebasestorage.app',
  messagingSenderId: '108028336132',
  appId: '1:108028336132:web:d49e8ec6020408c77cfd51',
  measurementId: 'G-3SJ2QVZH3T'
}

const actionCodeSettings = {
  url: 'https://hellonewme.be/index.html',
  handleCodeInApp: true
}

export type FirebaseDatabaseFormat = object | any[] | number | string | boolean | any

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

export const signInWithEmailAndPassword = (email, password) => _signInWithEmailAndPassword(auth, email, password)

export const signinWithGoogle = async () => {
  const provider = new GoogleAuthProvider()
  provider.addScope('email')
  provider.addScope('profile')

  const result = await _signInWithPopup(auth, provider)

  if (result) {
    // This is the signed-in user
    const user = result.user
    console.log({ user })

    // This gives you a Google Access Token.
    const credential = GoogleAuthProvider.credentialFromResult(result)
    const token = credential.accessToken

    return user
  }
  return undefined
}

const login = async () => {}

const logout = async () => {}

let userDetails
let userRoles
let userDefaultPage

let isUserReady

let userReady: Promise<User>

const createUserReady = async () => {
  isUserReady = undefined
  userReady = new Promise((resolve) => (isUserReady = resolve))
}
export const auth = await getAuth(app)

createUserReady()

auth.onAuthStateChanged(async (user) => {
  console.log('auth state changed', user)

  if (user) {
    userDetails = user
    userRoles = await get(`users/${user.uid}/roles`)
    userDefaultPage = await get(`users/${user.uid}/defaultPage`)
    isUserReady(user)
  } else {
    isUserReady(undefined)
    createUserReady()
    userDetails = undefined
    userRoles = undefined
    userDefaultPage = undefined
  }
})

const onChildAdded = (target, cb) => {
  _onChildAdded(ref(database, target), cb)
}
const onChildRemoved = (target, cb) => {
  _onChildRemoved(ref(database, target), cb)
}

const onChildChanged = (target, cb) => {
  _onChildChanged(ref(database, target), cb)
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
  database,
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
