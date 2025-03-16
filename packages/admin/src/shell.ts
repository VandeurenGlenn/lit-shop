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
import { PropertyProviders } from './property-providers.js'

globalThis.translate = translate
globalThis.pubsub = globalThis.pubsub || new PubSub()

declare global {
  interface HTMLElementTagNameMap {
    'admin-shell': AdminShell
  }
}

@customElement('admin-shell')
export class AdminShell extends PropertyProviders {
  router

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

  async select(paths, selection, routeInfo) {
    this.loading = true
    console.log(paths, selection)
    console.log(this)

    const route = paths.join('/')

    // if (paths.includes('catalog') && !customElements.get('catalog-section')) await import('./catalog.js')
    // if (paths.includes('media') && !customElements.get('media-section')) await import('./media.js')
    // const routeInfo = Router.routes[route]
    if (
      paths[0] === 'catalog' ||
      paths[0] === 'categories' ||
      paths[0] === 'settings' ||
      paths[0] === 'media' ||
      paths[0] === 'orders'
    ) {
      if (!customElements.get(`${paths[0]}-section`)) await import(`./${paths[0]}-section.js`)
    }
    if (!customElements.get(routeInfo.tag)) await import(`./${routeInfo.import || routeInfo.tag}.js`)

    this.shadowRoot.querySelector('custom-selector').select(route)
    this.pages.select(paths[0], selection)
    console.log({ routeInfo })

    let previous = this.pages.querySelector(`[route="${paths[0]}"]`)
    if (previous) this.lastSelected = previous
    console.log(previous)

    previous.selection = selection
    previous.select?.(paths[0], selection)

    paths.shift()
    // if (routeInfo.hideHeader) this.#hideHeader()
    // else this.#showHeader()

    // this.commandElement.name = paths.join(' > ')

    // console.log(paths && i === paths.length - 1)
    console.log({ paths })

    const promises = []
    console.log({ route })

    if (paths.length === 0 && this.propertyProviders[route]) {
      await this.handlePropertyProvider(route)
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
        case 'orders':
        case 'order':
          console.log('orders')

          promises.push(this.handlePropertyProvider('orders'))
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
        default:
          promises.push(this.handlePropertyProvider(route))
      }

      if (selection && el) el.selection = selection

      previous.select?.(paths[i], selection)
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
