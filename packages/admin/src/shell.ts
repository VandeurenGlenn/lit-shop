
import { controller as firebaseController } from '@lit-shop/firebase-controller';
import './animations/busy.js'
import './elements/dialog/login-dialog.js'
import '@lit-shop/translate/string.js';
import Router from './router.js';
import { translate } from '@lit-shop/translate';
import PubSub from '@vandeurenglenn/little-pubsub'
import '@vandeurenglenn/flex-elements'
import { LitElement } from 'lit';
import './menu/sub-menu.js'
import './menu/menu.js'
import {v4 as uuidv4} from 'uuid'
import { customElement, property, state } from 'lit/decorators.js';
import { ContextProvider } from '@lit-labs/context';
import { Offers, OffersContext } from './context/offers.js';
import { Images, ImagesContext } from './context/media/images.js';
import { Albums, AlbumsContext } from './context/media/albums.js';
import { Image, ImageContext } from './context/media/image.js';
import { Album, AlbumContext } from './context/media/album.js';
import { Offer, OfferContext } from './context/offer.js';
import '@vandeurenglenn/lit-elements/pages.js';


import template from './shell.html.js'
import styles from './shell.css.js'

globalThis.translate = translate
globalThis.pubsub = globalThis.pubsub || new PubSub()

declare global {
  var firebase
  var litShop: {
    contextProviders?: {[index: string]: any}
  }
  interface HTMLElementTagNameMap {
    'admin-shell': AdminShell
  }
}

@customElement('admin-shell')
export default class AdminShell extends LitElement {
  router

  #imagesContextProvider = new ContextProvider(this, {context: ImagesContext, initialValue: []});
  #offerContext = new ContextProvider(this, {context: OfferContext});
  #offersContext = new ContextProvider(this, {context: OffersContext});
  #albumsContextProvider = new ContextProvider(this, {context: AlbumsContext, initialValue: []});
  #imageContextProvider = new ContextProvider(this, {context: ImageContext});
  #albumContextProvider = new ContextProvider(this, {context: AlbumContext});

  set albums(value: Albums) {
    this.#albumsContextProvider.setValue(value)
    this.#albumsContextProvider.updateObservers()
  }

  get albums() {
    return this.#albumsContextProvider.value
  }

  set album(value: Album) {
    this.#albumContextProvider.setValue(value)
    this.#albumContextProvider.updateObservers()
  }

  get album() {
    return this.#albumContextProvider.value
  }

  set image(value: Image) {
    this.#imageContextProvider.setValue(value)
    this.#imageContextProvider.updateObservers()
  }

  get image() {
    return this.#imageContextProvider.value
  }
  set offers(value: Offers) {
    this.#offersContext.setValue(value)
    this.#offersContext.updateObservers()
  }

  get offers() {
    return this.#offersContext.value
  }
  set offer(value: Offer) {
    this.#offerContext.setValue(value)
    this.#offerContext.updateObservers()
  }

  get offer() {
    return this.#offerContext.value
  }

  set images(value: Images) {
    this.#imagesContextProvider.setValue(value)
    this.#imagesContextProvider.updateObservers()
  }

  get images() {
    return this.#imagesContextProvider.value
  }

  get pages() {
    return this.querySelector('custom-pages');
  }
  get selector() {
    return this.shadowRoot.querySelector('custom-selector');
  }
  get drawer() {
    return this.shadowRoot.querySelector('custom-drawer');
  }
  get translatedTitle() {
    return this.shadowRoot.querySelector('translate-string[name="title"]');
  }
  set drawerOpened(value) {
    if (value) this.setAttribute('drawer-opened', '');
    else this.removeAttribute('drawer-opened');
  }
  get drawerOpened() {
    return this.hasAttribute('drawer-opened');
  }

  get menuIcon() {
    return this.shadowRoot.querySelector('.menu');
  }

  get #loginDialog() {
    return this.shadowRoot.querySelector('login-dialog')
  }

  @property({ type:Boolean, reflect: true })
  set loading(value: boolean)  {
    document.dispatchEvent(new CustomEvent('loading', {detail: this.loading}))
  }

  constructor() {
    super();

    const setupApi = async () => {
      const importee = await import('./api.js')
      const Api =  importee.default
      globalThis.api = new Api()
    };

    (async () => {
      
      firebaseController.auth.onAuthStateChanged(async (user) => {
        this.user = user
        if (!this.user) await this.#login()
        else {
          
        const token = firebaseController.auth.currentUser.getIdToken()
          if (!globalThis.api) {
            
              await setupApi()
            this.router = new Router(this)
            
            globalThis.litShop = globalThis.litShop || {}
            litShop.contextProviders = litShop.contextProviders || {
              images: this,
              albums: this
            }
          }
          
          
          
        }

      })
      
    })()
  }
  async #login() {
    this.loading = false
    return new Promise(async (resolve, reject) => {
      this.#loginDialog.addEventListener('close', () => {
        resolve()
      })
      
      this.#loginDialog.open = true
    })
    
  }

  async select(paths, selection, routeInfo) {
    await this.updateComplete
    await this.pages.updateComplete
    this.loading = true
    console.log(paths, selection);
    
    const route = paths.join('/')

    if (paths.includes('catalog') && !customElements.get('catalog-section')) await import('./catalog.js')
    if (paths.includes('media') && !customElements.get('media-section')) await import('./media.js')
    // const routeInfo = Router.routes[route]
    if (!customElements.get(routeInfo.tag)) await import(`./${routeInfo.import || routeInfo.tag}.js`)
    this.shadowRoot.querySelector('top-menu').select(route)
    this.pages.select(paths[0], selection)
    let previous = this.pages.querySelector(`[route="${paths[0]}"]`)
    paths.shift()
    // if (routeInfo.hideHeader) this.#hideHeader()
    // else this.#showHeader()

    this.translatedTitle.innerHTML = paths.join(' > ')
    
    // console.log(paths && i === paths.length - 1 );
    console.log({paths});
    
    for (let i = 0; i < paths.length; i++) {
      const el = previous.shadowRoot.querySelector(`[route="${paths[i]}"]`)
      console.log(el);
      
      const route = el.getAttribute('route')
      console.log({route});
      const promises = []
      // TODO: once all updates are handed local atleast cache for a minute
      switch (route) {
        case 'offers':
          promises.push((async () => {
            this.offers = await (await fetch('/api/offers')).json()
          })())
          break
        case 'offer':
          // load offers only when undefined
          promises.push((async () => {
            this.images = await api.getImages()
          })(),
          (async () => {
            if (!this.offers) this.offers = await (await fetch('/api/offers')).json()
            this.offer = this.offers[selection]
          })())
          break
        case 'image':
          promises.push((async () => {
            this.image = await api.getImage(selection)
          })())
          break;
        case 'album':
          promises.push((async () => {
            this.album = await api.getAlbum(selection)
          })())
          break;
        case 'library':
          promises.push((async () => {
            this.images = await api.getImages()
          })())
          break;
        case 'albums':
          promises.push((async () => {
            this.albums = await api.getAlbums()
          })())
          break;
      }

      Promise.all(promises).then(() => this.loading = false)

      if (selection && i === paths.length - 1 ) el.selection = selection
      
      previous.select(paths[i], selection)

      previous = el
    }
  }

  static styles = [
    styles
  ]

  render() {
    return template
  }
}

