import '@vandeurenglenn/custom-date'
import '../../elements/input-fields/input-field.js'
import '../../elements/input-fields/input-fields.js'
import '../../elements/input-fields/sku-fields.js'
import '../../elements/input-fields/sku-field.js'
import '../../elements/input-fields/image-fields.js'
import '../../elements/input-fields/image-field.js'
import '@vandeurenglenn/lite-elements/dropdown-menu.js'
import '@vandeurenglenn/lite-elements/icon'
import '@vandeurenglenn/lite-elements/list-item.js'
import '@vandeurenglenn/lite-elements/toggle-button.js'
import '@vandeurenglenn/lite-elements/selector.js'
import '../../elements/time/time-ago.js'
import '@vandeurenglenn/flex-elements/container.js'
import '@material/web/fab/fab.js'
import '../../elements/dialog/images-dialog.js'
import '../../elements/image-editor/image-editor.js'
import '../../elements/product/product-image.js'
import '@vandeurenglenn/flex-elements/wrap-evenly.js'

import { map } from 'lit/directives/map.js'
import { LiteElement, customElement, property, query, html } from '@vandeurenglenn/lite'
import { StyleList, css } from '@vandeurenglenn/lite/element'
import firebase from '../../firebase.js'

@customElement('catalog-product')
export default class CatalogProduct extends LiteElement {
  key: string

  // @ts-ignore
  @property({ type: Array })
  accessor fields: [string, string | number | boolean | string[]][]

  @property({ type: Array, consumes: 'categories' })
  accessor categories

  // @ts-ignore
  @property({ type: Object, consumes: 'product' })
  accessor product

  @property({ type: String, value: 'general' })
  accessor selected = 'general'

  @property({ type: Array })
  accessor skuFields: [string, string | number | boolean | string[]][]

  @property({ type: Array, consumes: 'images' })
  accessor images

  @property({ type: Array })
  accessor imagesToRender

  addImage = async () => {
    const dialog = document.createElement('images-dialog')
    dialog.hasLibrary = true
    document.body.appendChild(dialog)

    const { action, fields, image } = await dialog.addImage()

    dialog.busy('Uploading image')
    console.log(action, image)

    if (action === 'submit') {
      let result = []
      if (image.type === 'base64[]') {
        result = await Promise.all(
          image.data.map(
            async (image) =>
              await api.addImage({
                type: 'base64',
                title: image.name.toString(),
                description: fields.description,
                image: image.data.replace('data:image/png;base64,', '').replace('data:image/jpeg;base64,', '')
              })
          )
        )

        const images = this.product.images || []
        for (const res of result) {
          console.log(res)

          const key = res.firebaseKey
          images.push(key)
        }

        this.product.images = images
      } else if (image.type === 'url') {
        result = [
          await api.addImage({
            type: image.type,
            title: fields.title || (image.data as string),
            description: fields.description,
            image: image.data as string
          })
        ]
      } else if (image.type === 'library') {
        console.log('from lib')
        const images = this.product.images || []
        images.push(image.data)
        this.product.images = images
      } else {
        result = [
          await api.addImage({
            type: image.type,
            title: fields.title,
            description: fields.description,
            image: image.data as string
          })
        ]
      }

      if (!this.product.images) this.product.images = []
      this._save()
      document.body.removeChild(dialog)
      this.requestRender()
    }
  }

  _onFabClick = () => {
    if (this.selected === 'images') {
      this.addImage()
      // this.shadowRoot.querySelector('image-fields').addImage()
    } else if (this.selected === 'SKUs') {
      this.shadowRoot.querySelector('sku-fields').addsku()
    } else {
      this.shadowRoot.querySelector('input-fields').addField()
    }
  }

  onChange(propertyKey) {
    if (propertyKey === 'product') {
      if (!this.product.category?.value)
        this.product.category = {
          value: this.product.category,
          type: 'select',
          options: this.categories
        }

      this.fields = Object.entries(this.product).filter(
        (entry) =>
          entry[0] !== 'key' &&
          entry[0] !== 'timestamp' &&
          entry[0] !== 'index' &&
          entry[0] !== 'SKUs' &&
          entry[0] !== 'images' &&
          entry[0] !== 'createdAt' &&
          entry[0] !== 'changedAt'
      )

      this.skuFields = this.product.SKUs
    }
    if ((propertyKey === 'selected' && this.images) || (propertyKey === 'images' && this.selected === 'images')) {
      if (this.product.images) {
        this.imagesToRender = this.images.filter((image) => this.product.images.includes(image.key))
      }
    }
  }
  _save = async () => {
    if (this.selected === 'general') {
      const values = this.shadowRoot.querySelector('input-fields').getValues()
      for (const label of Object.keys(values)) {
        this.product[label] = values[label]
      }
    } else if (this.selected === 'SKUs') {
      const values = this.shadowRoot.querySelector('sku-fields').getValues()
      this.product.SKUs = values
    } else if (this.selected === 'images') {
      // const images = Array.from(this.shadowRoot.querySelectorAll('product-image')) as ProductImage[]
      // this.product.images = images.map((image) => image.image.key)
    }

    try {
      await firebase.update(`products/${this.product.key}`, this.product)
      if (this.product.images) {
        this.imagesToRender = this.images.filter((image) => this.product.images.includes(image.key))
      }
    } catch (error) {
      console.error(error)
    }
  }

  _delete = async () => {
    const answer = confirm('are you sure you want to delete this product?')
    if (!answer) return
    try {
      await firebase.remove(`products/${this.product.key}`)
      location.hash = '/#!/catalog/products'
    } catch (error) {
      console.error(error)
    }
  }

  onSelected = (event) => {
    if (this.selected === 'general') {
      const values = this.shadowRoot.querySelector('input-fields').getValues()
      for (const label of Object.keys(values)) {
        this.product[label] = values[label]
      }
    } else if (this.selected === 'SKUs') {
      const values = this.shadowRoot.querySelector('sku-fields').getValues()
      this.product.SKUs = values
    } else if (this.selected === 'images') {
      const images = Array.from(this.shadowRoot.querySelectorAll('product-image')) as ProductImage[]
      if (images.length > 0) this.product.images = images.map((image) => image.image.key)
    }

    this.selected = event.detail
  }

  static styles?: StyleList = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        align-items: center;
        align-items: center;
        width: 100%;
      }

      flex-container {
        overflow-y: auto;
      }
      ::slotted(.timestamp) {
        width: 100%;
        height: 54px;
      }
      .toolbar {
        height: 72px;
        box-sizing: border-box;
        padding: 24px;
        width: 100%;
        max-width: 640px;
      }
      .wrapper {
        display: flex;
        box-sizing: border-box;
        padding: 12px 24px;
        width: 100%;
      }
      custom-svg-icon {
        cursor: pointer;
      }
      custom-selector {
        flex-direction: row;
      }

      custom-selector .custom-selected {
        background: var(--md-sys-color-secondary-container);
        color: var(--md-sys-color-on-secondary-container);
      }

      .action-bar {
        max-width: 640px;
        padding: 12px 24px;
        box-sizing: border-box;
      }

      custom-dropdown-menu::part(custom-dropdown),
      custom-dropdown-menu::part(custom-menu),
      .action-menu custom-list-item {
        min-width: 280px;
      }

      flex-row {
        width: 100%;
      }

      section {
        justify-content: center;
      }

      [non-interactive] {
        pointer-events: none;
      }

      md-fab {
        position: absolute;
        bottom: 24px;
        right: 24px;
      }

      flex-container {
        height: 100%;
      }
    `
  ]

  renderSelected() {
    if (this.selected === 'images') {
      return html`
        <flex-wrap-evenly>
          ${map(
            this.imagesToRender,
            (image) =>
              html`
                <product-image
                  .image=${image}
                  .productKey=${this.product.key}></product-image>
              `
          )}
        </flex-wrap-evenly>
      `
    }
    if (this.selected === 'SKUs') {
      return html`
        <flex-container>
          <flex-container class="wrapper">
            <sku-fields .fields=${this.product.SKUs}></sku-fields>
          </flex-container>
        </flex-container>
      `
    }

    return html`
      <flex-container>
        <flex-container class="wrapper">
          <input-fields .fields="${this.fields}"></input-fields>
        </flex-container>
      </flex-container>
    `
  }

  render() {
    return this.product
      ? html`
          <flex-row class="action-bar">
            <custom-selector
              attr-for-selected="label"
              @selected=${(event) => this.onSelected(event)}
              default-selected="general">
              <custom-button label="general">general</custom-button>
              <custom-button label="SKUs">SKUs</custom-button>
              <custom-button label="images">images</custom-button>
            </custom-selector>

            <flex-it></flex-it>

            <custom-dropdown-menu
              right
              class="action-menu">
              <custom-list-item @click=${this._save}>
                <span slot="start"> <custom-icon icon="save"></custom-icon></span>
                <span slot="end"> save </span>
              </custom-list-item>
              <custom-list-item @click=${this._delete}>
                <span slot="start"> <custom-icon icon="delete"></custom-icon></span>
                <span slot="end"> delete </span>
              </custom-list-item>

              <custom-list-item non-interactive>
                <span slot="start">edited</span>
                <time-ago
                  slot="end"
                  value=${this.product.changedAt}></time-ago>
              </custom-list-item>
            </custom-dropdown-menu>
          </flex-row>

          ${this.renderSelected()}
          <md-fab @click=${this._onFabClick}>
            <custom-icon
              icon="add"
              slot="icon"></custom-icon>
          </md-fab>
        `
      : html``
  }
}
