import { controller as firebaseController } from '@lit-shop/firebase-controller'
import { LiteElement, property, customElement, query } from '@vandeurenglenn/lite'
import '@vandeurenglenn/lite-elements/theme.js'
import './animations/busy.js'
import './elements/dialog/login-dialog.js'
import '@lit-shop/translate/string.js'
import Router from './router.js'
import { translate } from '@lit-shop/translate'
import PubSub from '@vandeurenglenn/little-pubsub'

import '@vandeurenglenn/lite-elements/pages.js'
import './menu/sub-menu.js'
import './menu/menu.js'

import template from './shell.html.js'
import styles from './shell.css.js'

import { auth } from './firebase.js'

globalThis.translate = translate
globalThis.pubsub = globalThis.pubsub || new PubSub()

declare global {
  var litShop: {
    contextProviders?: { [index: string]: any }
  }
  interface HTMLElementTagNameMap {
    'admin-shell': AdminShell
  }
}

@customElement('admin-shell')
export class AdminShell extends LiteElement {
  router

  @property({ provides: true }) accessor albums = []

  @property({ provides: true }) accessor album

  @property({ provides: true }) accessor images

  @property({ provides: true }) accessor image

  @property({ provides: true }) accessor products

  @property({ provides: true }) accessor product

  @property({ provides: true }) accessor categories

  @property({ type: Boolean, reflect: true }) accessor loading

  @query('custom-pages') accessor pages

  @query('custom-selector') accessor selector

  @query('custom-drawer') accessor drawer

  get translatedTitle() {
    return this.shadowRoot.querySelector('translate-string[name="title"]')
  }
  set drawerOpened(value) {
    if (value) this.setAttribute('drawer-opened', '')
    else this.removeAttribute('drawer-opened')
  }
  get drawerOpened() {
    return this.hasAttribute('drawer-opened')
  }

  get menuIcon() {
    return this.shadowRoot.querySelector('.menu')
  }

  get #loginDialog() {
    return this.shadowRoot.querySelector('login-dialog')
  }

  onChange(propertyKey: string, value: any): void {
    if (propertyKey === 'loading') {
      document.dispatchEvent(new CustomEvent('loading', { detail: this.loading }))
    }
  }

  async firstRender(): Promise<void> {
    const setupApi = async () => {
      const importee = await import('./api.js')
      const Api = importee.default
      globalThis.api = new Api()
    }

    auth.onAuthStateChanged(async (user) => {
      console.log(user)

      this.user = user
      if (!this.user) await this.#login()
      else {
        await setupApi()
        this.router = new Router(this)
      }
    })
  }

  async #login() {
    this.loading = false
    return new Promise(async (resolve, reject) => {
      this.#loginDialog.addEventListener('close', (event) => {
        resolve(event.detail)
      })

      this.#loginDialog.open = true
    })
  }

  async select(paths, selection, routeInfo) {
    this.loading = true
    console.log(paths, selection)
    console.log(this)

    const route = paths.join('/')

    // if (paths.includes('catalog') && !customElements.get('catalog-section')) await import('./catalog.js')
    // if (paths.includes('media') && !customElements.get('media-section')) await import('./media.js')
    // const routeInfo = Router.routes[route]
    if (paths[0] === 'catalog' || paths[0] === 'categories' || paths[0] === 'settings' || paths[0] === 'media') {
      if (!customElements.get(`${paths[0]}-section`)) await import(`./${paths[0]}-section.js`)
    }
    if (!customElements.get(routeInfo.tag)) await import(`./${routeInfo.import || routeInfo.tag}.js`)
    this.shadowRoot.querySelector('top-menu').select(route)
    this.pages.select(paths[0], selection)
    console.log({ routeInfo })

    let previous = this.pages.querySelector(`[route="${paths[0]}"]`)
    paths.shift()
    // if (routeInfo.hideHeader) this.#hideHeader()
    // else this.#showHeader()

    this.translatedTitle.innerHTML = paths.join(' > ')

    // console.log(paths && i === paths.length - 1 );
    console.log({ paths })

    for (let i = 0; i < paths.length; i++) {
      let el = previous.querySelector(`[route="${paths[i]}"]`)

      if (!el && previous.shadowRoot) el = previous.shadowRoot.querySelector(`[route="${paths[i]}"]`)
      console.log(el)

      const route = el.getAttribute('route')
      console.log({ route })
      const promises = []
      // TODO: once all updates are handed local atleast cache for a minute
      switch (route) {
        case 'categories':
          promises.push(
            (async () => {
              this.categories = await (await fetch('/api/categories')).json()
            })()
          )
          break
        case 'products':
          promises.push(
            (async () => {
              this.products = await (await fetch('/api/products')).json()
            })()
          )
          break
        case 'product':
          // load products only when undefined
          promises.push(
            (async () => {
              this.images = await api.getImages()
            })(),
            (async () => {
              if (!this.products) this.products = await (await fetch('/api/products')).json()
              this.product = this.products[selection]
            })()
          )
          break
        case 'image':
          promises.push(
            (async () => {
              this.image = await api.getImage(selection)
            })()
          )
          break
        case 'album':
          promises.push(
            (async () => {
              this.album = await api.getAlbum(selection)
            })()
          )
          break
        case 'library':
          promises.push(
            (async () => {
              this.images = await api.getImages()
            })()
          )
          break
        case 'albums':
          promises.push(
            (async () => {
              this.albums = await api.getAlbums()
              console.log(this.albums)
            })()
          )
          break
      }

      Promise.all(promises).then(() => (this.loading = false))

      if (selection && i === paths.length - 1) el.selection = selection

      previous.select(paths[i], selection)

      previous = el
    }
  }

  styles = [styles]

  render() {
    return template
  }
}
