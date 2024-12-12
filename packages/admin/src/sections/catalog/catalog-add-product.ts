import '../../image-nails.js'
// import 'custom-input';
import '@vandeurenglenn/custom-date/custom-date.js'
import { generateUUID } from '@lit-shop/utils'
import '../../elements/input-fields/input-fields.js'
import { LiteElement, html, customElement, property } from '@vandeurenglenn/lite'
import '@vandeurenglenn/flex-elements/container.js'
import { StyleList, css } from '@vandeurenglenn/lite/element'
import '@material/web/fab/fab.js'
import '@vandeurenglenn/lite-elements/icon.js'
import { InputField } from '../../elements/input-fields/input-field.js'
import firebase from '../../firebase.js'

@customElement('catalog-add-product')
export default class CatalogAddProduct extends LiteElement {
  @property({ type: String }) accessor product

  @property({ type: Array }) accessor fields: string[][]

  @property({ type: String }) accessor sku: string

  @property({ type: String }) accessor uniqueId: string

  connectedCallback() {
    this.fields = [
      ['name', ''],
      ['price', '']
    ]
  }
  async addProduct() {
    console.log('add product')

    const fields = Array.from(
      this.shadowRoot.querySelector('input-fields').shadowRoot.querySelectorAll('input-field')
    ) as InputField[]
    const product = {}

    for (const field of fields) {
      product[field.name] = field.value
    }

    const key = await firebase.push('products', product)
    location.hash = `#!/catalog/products`
  }

  static styles?: StyleList = [
    css`
    md-fab {
      position: absolute;
      bottom: 24px;
      right: 24px;
    }
    
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    flex-container {
      overflow-y: auto;
    }
    ::slotted(.column) {
      mixin(--css-column)
      width: 100%;
      min-height: 110px;
    }
    ::slotted(.timestamp) {
      mixin(--css-row)
      mixin(--css-center)
      width: 100%;
      height: 54px;
    }
    ::slotted(*.flex) {
      mixin(--css-flex)
    }
    .toolbar {
      height: 72px;
      box-sizing: border-box;
      padding: 24px;
      width: 100%;
      max-width: 640px;
    }
    [icon="add"] {
      margin-top: 24px;
    }
    .wrapper {
      display: flex;
      box-sizing: border-box;
      padding: 12px 24px 24px;
      width: 100%;
    }
    custom-svg-icon {
      cursor: pointer;
    }
    ::slotted(.key) {
      width: 100%;
      mixin(--css-row)
      mixin(--css-center)
    }
    apply(--css-row)
    apply(--css-center)
    apply(--css-flex)
    `
  ]
  render() {
    console.log(this.fields)

    return html`
      <flex-container>
        <p>sku: ${this.sku}</p>
        ${this.fields ? html`<input-fields .fields=${this.fields}></input-fields>` : ''}
      </flex-container>

      <md-fab
        variant="tonal"
        @click=${() => this.addProduct()}>
        <custom-icon
          slot="icon"
          icon="save"></custom-icon>
      </md-fab>
    `
  }
}
