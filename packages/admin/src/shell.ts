import { LiteElement, property, customElement, query } from '@vandeurenglenn/lite'
import '@vandeurenglenn/lite-elements/theme.js'
import './animations/busy.js'
import './elements/dialog/login-dialog.js'
import '@lit-shop/translate/string.js'
import Router from './router.js'
import { translate } from '@lit-shop/translate'
import PubSub from '@vandeurenglenn/little-pubsub'
import '@vandeurenglenn/lite-elements/pages.js'
import template from './shell.html.js'
import styles from './shell.css.js'

import { auth } from './firebase.js'

globalThis.translate = translate
globalThis.pubsub = globalThis.pubsub || new PubSub()

declare global {
  interface HTMLElementTagNameMap {
    'admin-shell': AdminShell
  }
}

@customElement('admin-shell')
export class AdminShell extends LiteElement {
  router
  #propertyProviders = []

  @property({ provides: true }) accessor albums = []

  @property({ provides: true }) accessor album

  @property({ provides: true }) accessor images

  @property({ provides: true }) accessor image

  @property({ provides: true, type: Array }) accessor products: []

  @property({ provides: true }) accessor product

  @property({ provides: true, batches: true, batchDelay: 1000 }) accessor orders

  @property({ provides: true, batches: true, batchDelay: 1000 }) accessor categories

  @property({ provides: true }) accessor stats

  @property({ provides: true }) accessor imgurBaseImages

  @property({ type: Boolean, reflect: true }) accessor loading

  @query('custom-pages') accessor pages

  @query('custom-selector') accessor selector

  @query('custom-drawer') accessor drawer

  get commandElement() {
    return this.shadowRoot.querySelector('command-element')
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
    console.log('first render')
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

    // this.commandElement.addEventListener('command', (event) => {
    //   console.log(event.detail)
    //   if (event.detail.command === 'search') {
    //     // this.router.search(event.detail.value)
    //     // this.router.command(event.detail.value)
    //   }
    //   // this.router.command(event.detail)
    // })
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

  /**
   * collection of the views and there desired providers
   */
  propertyProviders = {
    products: ['products', 'categories'],
    'add-product': ['products', 'categories'],
    'catalog-products': ['products', 'categories'],
    'catalog-product': ['products', 'categories'],
    orders: ['orders', 'products', 'categories', 'images'],
    // sales: [
    //   'products',
    //   'categories',
    //   {
    //     name: 'payconiqTransactions',
    //     type: 'array',
    //     events: { onChildChanged: (val) => this.salesView.payconiqPaymentChange(val) }
    //   },
    //   { name: 'promo', type: 'object' },
    //   'members',
    //   'tabs'
    // ],

    images: ['images'],
    stock: ['products', 'categories'],
    categories: ['categories'],
    members: ['members', { name: 'attendance', type: 'object' }],
    planning: [{ name: 'planning', type: 'object' }],
    calendar: ['members', { name: 'planning', type: 'object' }, { name: 'calendar', type: 'object' }],
    files: ['members', { name: 'files', type: 'object' }],
    'add-event': ['events', 'categories', 'products']
  }

  setupPropertyProvider(propertyProvider, type = 'array', events?) {
    return new Promise(async (resolve, reject) => {
      this.#propertyProviders.push(propertyProvider)

      if (!this[propertyProvider]) this[propertyProvider] = type === 'object' ? {} : []

      const deleteOrReplace = async (propertyProvider, snap, task = 'replace') => {
        const val = await snap.val()
        if (type === 'array') {
          if (typeof val === 'object' && !Array.isArray(val)) val.key = snap.key
          let i = -1

          for (const item of this[propertyProvider]) {
            i += 1
            if (item.key === snap.key) break
          }

          if (task === 'replace') this[propertyProvider].splice(i, 1, val)
          else this[propertyProvider].splice(i, 1)
          this[propertyProvider] = [...this[propertyProvider]]
        } else if (type === 'object') {
          if (task === 'replace') this[propertyProvider][snap.key] = val
          else delete this[propertyProvider][snap.key]
          this[propertyProvider] = { ...this[propertyProvider] }
        }

        if (task === 'replace') events?.onChildChanged?.(val)
        else events?.onChildRemoved?.(val)
      }

      firebase.onChildAdded(propertyProvider, async (snap) => {
        const val = await snap.val()

        if (type === 'array') {
          if (typeof val === 'object' && !Array.isArray(val)) val.key = snap.key
          if (!this[propertyProvider]) {
            this[propertyProvider] = [val]
          } else if (!this[propertyProvider].includes(val)) {
            this[propertyProvider].push(val)
          }
          this[propertyProvider] = [...this[propertyProvider]]
        } else if (type === 'object') {
          if (!this[propertyProvider]) this[propertyProvider] = {}
          this[propertyProvider][snap.key] = val
          this[propertyProvider] = { ...this[propertyProvider] }
        }
        events?.onChildAdded?.(val)
        resolve(this[propertyProvider])
      })

      setTimeout(async () => {
        resolve(true)
      }, 1000)

      firebase.onChildChanged(propertyProvider, (snap) => deleteOrReplace(propertyProvider, snap, 'replace'))
      firebase.onChildRemoved(propertyProvider, (snap) => deleteOrReplace(propertyProvider, snap, 'delete'))
    })
  }

  handlePropertyProvider(propertyProvider) {
    if (this.propertyProviders[propertyProvider]) {
      for (const input of this.propertyProviders[propertyProvider]) {
        let propertyKey
        if (typeof input === 'object') propertyKey = input.name
        else propertyKey = input

        if (!this.#propertyProviders.includes(propertyKey))
          return this.setupPropertyProvider(propertyKey, input?.type, input?.events)
      }
    }
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

    this.shadowRoot.querySelector('custom-selector').select(route)
    this.pages.select(paths[0], selection)
    console.log({ routeInfo })

    let previous = this.pages.querySelector(`[route="${paths[0]}"]`)
    if (previous) this.lastSelected = previous
    console.log(previous)

    paths.shift()
    // if (routeInfo.hideHeader) this.#hideHeader()
    // else this.#showHeader()

    // this.commandElement.name = paths.join(' > ')

    // console.log(paths && i === paths.length - 1)
    console.log({ paths })

    const promises = []
    console.log({ route })

    if (paths.length === 0) {
      switch (route) {
        case 'settings':
          promises.push(this.handlePropertyProvider('categories'))
          break
        case 'media':
          promises.push(this.handlePropertyProvider('albums'))
          break
        case 'catalog':
        case 'stock':
        case 'orders':
          promises.push(
            this.handlePropertyProvider('orders'),
            this.handlePropertyProvider('products'),
            this.handlePropertyProvider('images')
          )
          break
      }
      await Promise.all(promises)
      this.loading = false
      return
    }

    for (let i = 0; i < paths.length; i++) {
      let el = previous.querySelector(`[route="${paths[i]}"]`)

      if (!el && previous.shadowRoot) el = previous.shadowRoot.querySelector(`[route="${paths[i]}"]`)
      console.log(el)

      if (el) this.lastSelected = el
      const route = el ? el.getAttribute('route') : paths[i]
      console.log({ route })
      // TODO: once all updates are handed local atleast cache for a minute
      switch (route) {
        case 'add-product':
          promises.push(
            this.handlePropertyProvider('images'),
            this.handlePropertyProvider('categories'),
            this.handlePropertyProvider('stats')
          )
          break
        case 'categories':
          promises.push(this.handlePropertyProvider('categories'))
          break
        case 'products':
        case 'stock':
        case 'orders':
          promises.push(
            this.handlePropertyProvider('images'),
            this.handlePropertyProvider('orders'),
            this.handlePropertyProvider('products')
          )
          break
        case 'product':
          // load products only when undefined
          promises.push(
            this.handlePropertyProvider('categories'),
            this.handlePropertyProvider('images'),
            (async () => {
              await this.handlePropertyProvider('products')
              this.product = this.products.find((product) => product.key === selection)
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
              this.imgurBaseImages = await api.getImages()
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

      if (selection && i === paths.length - 1 && el) el.selection = selection

      previous.select(paths[i], selection)
      if (el) previous = el
    }

    if (promises?.length > 0) await Promise.all(promises)
    this.loading = false
  }

  static styles = [styles]

  render() {
    return template
  }
}
