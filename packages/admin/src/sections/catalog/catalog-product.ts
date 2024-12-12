import { product, productContext } from '../../context/product.js'
import { consume } from '@lit-labs/context'
import { controller as firebaseController } from '@lit-shop/firebase-controller'

import '@vandeurenglenn/custom-date'
import '../../elements/input-fields/input-field.js'
import '../../elements/input-fields/input-fields.js'
import '@vandeurenglenn/lite-elements/dropdown-menu.js'
import '@vandeurenglenn/lite-elements/icon'
import '@vandeurenglenn/lite-elements/list-item.js'
import '@vandeurenglenn/lite-elements/toggle-button.js'
import '@vandeurenglenn/lite-elements/pages.js'
import '../../elements/time/time-ago.js'
import '@vandeurenglenn/flex-elements/container.js'
import '@material/web/fab/fab.js'
import '../../elements/dialog/image-selector-dialog.js'
import '../../elements/image-editor/image-editor.js'

import { map } from 'lit/directives/map.js'
import { CustomPages } from '../../types.js'
import { ref, set } from 'firebase/database'
import { LiteElement, customElement, property, query, html } from '@vandeurenglenn/lite'
import { StyleList, css } from '@vandeurenglenn/lite/element'

@customElement('catalog-product')
export default class CatalogProduct extends LiteElement {
  key: string

  @query('custom-pages')
  accessor pages: CustomPages

  // @ts-ignore
  @property({ type: Array })
  accessor fields: [string, string | number | boolean | string[]][]

  // @ts-ignore
  @property({ type: Object, consumes: 'product' })
  accessor product: product

  get #dialog() {
    return this.shadowRoot.querySelector('image-selector-dialog')
  }

  addImage = async () => {
    const { action, fields, image } = await this.#dialog.addImage()
    console.log(action, image)

    if (action === 'submit') {
      let result = []
      if (image.type === 'base64[]') {
        result = await Promise.all(
          image.data.map(
            async (image) =>
              await api.addImage({
                type: 'base64',
                title: image.name,
                description: fields.description,
                image: image.data.replace('data:image/png;base64,', '')
              })
          )
        )
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
        result = [await api.getImage(image.data)]
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

      for (const item of result) {
        console.log(item)
        this.product.images.push(item.link)
        // this.album.images.push(item)
      }
      this._save()

      this.requestRender()
    }
  }

  onChange(propertyKey) {
    if (propertyKey === 'product') {
      this.fields = Object.entries(this.product).filter(
        (entry) =>
          entry[0] !== 'key' &&
          entry[0] !== 'sku' &&
          entry[0] !== 'timestamp' &&
          entry[0] !== 'index' &&
          entry[0] !== 'public' &&
          entry[0] !== 'images'
      )
    }
  }
  _save = async () => {
    const _ref = ref(firebaseController.database, `products/${this.product.key}`)
    try {
      await set(_ref, this.product)
    } catch (error) {
      console.error(error)
    }
  }

  static styles?: StyleList = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        align-items: center;
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
      [icon='add'] {
        margin-top: 24px;
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

      .top-bar {
        /* padding: 24px 0 48px 0; */
      }

      md-fab {
        position: absolute;
        bottom: 24px;
        right: 24px;
      }
    `
  ]

  render() {
    return this.product
      ? html`
          <image-selector-dialog has-library></image-selector-dialog>
          <flex-row class="action-bar">
            <custom-selector
              attr-for-selected="label"
              @selected=${({ detail }) => this.pages.select(detail)}
              default-selected="general">
              <custom-button label="general">general</custom-button>
              <custom-button label="images">images</custom-button>
            </custom-selector>

            <flex-it></flex-it>

            <custom-dropdown-menu
              right
              class="action-menu">
              <custom-list-item @click=${this._save}>
                <span slot="start"> <custom-icon>save</custom-icon></span>
                <span slot="end"> save </span>
              </custom-list-item>

              <custom-list-item non-interactive>
                <span slot="start">edited</span>
                <time-ago
                  slot="end"
                  value=${this.product.timestamp}></time-ago>
              </custom-list-item>
            </custom-dropdown-menu>
          </flex-row>

          <custom-pages
            attr-for-selected="route"
            default-selected="general">
            <section route="general">
              <flex-container>
                <flex-row class="top-bar">
                  <custom-typography>sku:</custom-typography>
                  <flex-it></flex-it>
                  ${this.product?.sku ? this.product.sku : this.product.key}
                </flex-row>
                <input-field
                  name="public"
                  value=${this.product.public}
                  is-check-box></input-field>
                <input-fields .fields=${this.fields}></input-fields>
              </flex-container>
            </section>

            <section route="images">
              <flex-container>
                <flex-wrap-center>
                  ${map(
                    this.product?.images,
                    (image) => html` <img src=${`${location.origin}/api/image?image=${image}`} /> `
                  )}
                </flex-wrap-center>
              </flex-container>
              <md-fab
                variant="primary"
                label="add image"
                @click=${this.addImage}>
                <custom-icon slot="icon">add_a_photo</custom-icon>
              </md-fab>
            </section>
          </custom-pages>
        `
      : html``
  }
}
