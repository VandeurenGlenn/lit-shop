export declare type RouteOptions = {
  hideHeader?: boolean
  hideDrawer?: boolean
}

export declare type Route = {
  tag: string
  import?: string
  options?: RouteOptions
}

/**
 * @example
 *
 *
    'catalog/product': {
      tag: 'catalog-product',
      options: {
        hideHeader: true
      }

    }
 *
 */
export declare type Routes = { [key: string]: Route }

class Selectable extends HTMLElement {
  constructor(parameters) {
    super()
  }

  /**
   * @example
   * url('/path/path/path?selected=selection')
   * const paths = ['path', 'path', 'path']
   * const selection = url.searchParams.get('selected')
   *
   * select(paths, selection)
   *
   * @param paths []string
   * @param selection string
   */
  select(paths: string[], selection: string, route: string, routeInfo?: Route) {}
}

export default class Router {
  host: Selectable

  static routes: Routes = {
    '/media/images/albums': {
      tag: 'images-albums'
    },
    '/media/images/album': {
      tag: 'images-album'
    },
    '/media/images/library': {
      tag: 'images-library'
    },
    '/media/images/image': {
      tag: 'images-image'
    },
    '/media/videos/albums': {
      tag: 'videos-albums'
    },
    '/media/videos/library': {
      tag: 'videos-library'
    },
    '/media': {
      tag: 'media-section'
    },
    '/orders': {
      tag: 'orders-section'
    },
    '/stock': {
      tag: 'stock-section'
    },
    '/catalog/add-product': {
      tag: 'catalog-add-product'
    },
    '/catalog/products': {
      tag: 'catalog-products'
    },
    '/catalog/categories': {
      tag: 'catalog-categories'
    },
    '/catalog/product': {
      tag: 'catalog-product'
    },
    '/catalog': {
      tag: 'catalog-section'
    },
    '/settings': {
      tag: 'settings-section'
    },
    '/qrcodes': {
      tag: 'qrcodes-section'
    },
    '/giftcards': {
      tag: 'giftcards-section'
    },
    '/sales': {
      tag: 'sales-section'
    }
  }

  constructor(host: Selectable) {
    this.host = host

    globalThis.onhashchange = () => {
      const hash = location.hash
      const url = new URL(hash.split('#!/')[1], location.origin)

      // for (const e of  url.searchParams.entries()) {
      //   console.log(e);
      // }
      const routeInfo = Router.routes[url.pathname]
      const paths = url.pathname.split('/')
      paths.shift()

      const selection = url.searchParams.get('selected')
      const selected = paths.join('/')
      // if (history.state !== selected) history.pushState({selected}, selected, `#!/${selection ? `${selected}?selected=${selection}` : selected}`);
      this.host.select(paths, selection, routeInfo)
    }
    if (!location.hash) location.hash = '#!/catalog/products'
    // @ts-ignore
    onhashchange()
  }
}
