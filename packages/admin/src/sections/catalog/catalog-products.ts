import { LiteElement, css, html, property, customElement } from '@vandeurenglenn/lite'
import { map } from 'lit/directives/map.js'
import '@material/web/list/list.js'
import '@vandeurenglenn/lite-elements/list.js'
import '@vandeurenglenn/lite-elements/list-item.js'
import '../../elements/items/product-item.js'
import '@material/web/fab/fab.js'
import { Product } from '@lit-shop/types'
import { ProductItem } from '../../elements/items/product-item.js'

@customElement('catalog-products')
export class CatalogProducts extends LiteElement {
  @property({ type: Array, consumes: 'products' })
  accessor products

  constructor() {
    super()
    this._onClick = this._onClick.bind(this)
    this._onFabClick = this._onFabClick.bind(this)
  }

  async connectedCallback() {
    this.addEventListener('click', this._onClick)
    this.shadowRoot.querySelector('.container').ondragover = (event) => {
      event.preventDefault()
    }
    this.shadowRoot.querySelector('.container').ondrop = async (event) => {
      event.preventDefault()
      console.log(event.target)

      const target = event.composedPath()[0]
      var data = event.dataTransfer.getData('text')
      console.log(data)
      const node = this.shadowRoot.querySelector(`[key="${data}"]`)
      console.log(node)
      const clone = document.createElement('product-item') as ProductItem
      console.log(target)
      if (target.position === node.position) return
      else {
        this.shadowRoot.querySelector('custom-list').removeChild(node)
        this.shadowRoot.querySelector('custom-list').insertBefore(clone, event.target)
      }
      clone.key = node.key
      clone.name = node.name
      clone.position = node.position
      clone.dataset.route = node.dataset.route

      console.log(event)
      const items = Array.from(this.shadowRoot.querySelectorAll('product-item'))

      const promises = []

      for (const item of items) {
        promises.push(() => {
          item.position = i
          promises.push(firebase.set(`products/${item.key}/position`, item.position))
        })
      }
      await Promise.all(promises)
    }
  }

  _onClick(e) {
    // this.selected =
    const target = e.composedPath()[0]
    console.log(e)

    if (target.localName === 'product-item') {
      this.selected = target.dataset.route
      this.product = this.products[this.selected]
      globalThis.adminGo('product', this.selected)
    }
  }

  _onFabClick(event) {
    event.preventDefault()
    event.stopImmediatePropagation()
    const host = document
      .querySelector('admin-shell')
      .querySelector('catalog-section')
      .shadowRoot.querySelector('custom-pages')
    if (!host.querySelector('catalog-add-product')) {
      const addProduct = document.createElement('catalog-add-product')
      addProduct.setAttribute('route', 'add-product')
      host.appendChild(addProduct)
    }

    location.hash = '#!/catalog/add-product'
  }

  static styles = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        user-select: none;
      }

      header {
        display: flex;
        flex-direction: row;
        padding: 12px 24px;
      }

      header,
      custom-list {
        width: 100%;
        min-width: 320px;
        max-width: 640px;
        box-sizing: border-box;
      }

      custom-list {
        padding: 12px;
      }

      .container {
        display: flex;
        flex-direction: column;
        overflow: auto;
        width: 100%;
        gap: 6px;
      }
      .name {
        min-width: 240px;
      }

      md-fab {
        position: fixed;
        bottom: 24px;
        right: 24px;
      }

      ::slotted(:nth-of-type(odd)) {
        background: #38464e;
      }
    `
  ]

  render() {
    return html`
      <header>
        <custom-svg-icon icon="filter-list"></custom-svg-icon>
        <span class="flex"></span>
        <custom-svg-icon icon="mode-edit"></custom-svg-icon>
        <custom-svg-icon icon="search"></custom-svg-icon>
      </header>
      <!-- <header>
  <translate-string class="name">name</translate-string>
  <flex-it></flex-it>
  <translate-string style="padding-right: 24px">stock</translate-string>

  <translate-string>public</translate-string>
</header>
-->
      <custom-list class="container">
        ${this.products
          ? map(
              this.products.sort((a, b) => a.position - b.position),
              (product) => html`
                <product-item
                  .name=${product.name}
                  .key=${product.key}
                  .position=${product.position}
                  .public=${product.public}
                  data-route=${product.key}></product-item>
              `
            )
          : ''}
      </custom-list>

      <md-fab @click=${this._onFabClick}>
        <custom-icon
          icon="add"
          slot="icon"></custom-icon>
      </md-fab>
    `
  }
}
