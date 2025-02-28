import { LiteElement, customElement, property, query, html, queryAll } from '@vandeurenglenn/lite'
import '@vandeurenglenn/flex-elements/row.js'
import '@vandeurenglenn/lite-elements/toggle-button.js'
import '@material/web/textfield/outlined-text-field.js'

import '@vandeurenglenn/lite-elements/typography.js'
import '@lit-shop/translate/string.js'
import { StyleList, css } from '@vandeurenglenn/lite/element'
import '@material/web/select/outlined-select.js'
import '@material/web/select/select-option.js'
import { MdOutlinedTextField } from '@material/web/textfield/outlined-text-field.js'
import { debounce } from '../../debounce.js'
import '../camera/element.js'
import '../qrcode-scanner.js'

@customElement('sku-field')
export class SkuField extends LiteElement {
  @property({ type: Boolean, reflect: true }) accessor scanning

  @property({ type: Object, attribute: false }) accessor field

  @queryAll('md-outlined-text-field') accessor fields

  @query('camera-element') accessor cameraElement

  async firstRender(): Promise<void> {
    const fields = Array.from(this.shadowRoot.querySelectorAll('md-outlined-text-field')) as MdOutlinedTextField[]
    fields.forEach(async (field) => {
      await field.updateComplete

      // if (!this[field.label]) this[field.label] = field.placeholder
      field.addEventListener('input', () => this._oninput(field))
    })
    const select = this.shadowRoot.querySelector('md-outlined-select')
    await select.updateComplete
    this.field.unit = select.value
    select.addEventListener('input', (e) => {
      this.field.unit = select.value
    })
  }

  private _oninput = (field) => {
    debounce(() => {
      this.field[field.label] = field.value
    })()
  }

  checkValidity() {
    let valid = true
    this.fields.forEach((field) => {
      if (!field.checkValidity()) {
        if (field.minLength && field.value.length < field.minLength) {
          field.errorText = `${field.label} is too short min (${field.minLength})`
        } else if (field.maxLength && field.value.length > field.maxLength) {
          field.errorText = `${field.label} is too long (max ${field.maxLength})`
        } else {
          field.errorText = `${field.label} is required`
        }
        field.error = true
        valid = false
      }
    })
    return valid
  }

  static styles?: StyleList = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        width: 100%;
        margin-bottom: 16px;
        box-sizing: border-box;
        padding: 16px;

        border-radius: var(--md-sys-shape-corner-medium);
        background: var(--md-sys-color-surface-container-high);
        pointer-events: auto;
      }

      md-outlined-text-field[label='EAN'] {
        margin-bottom: 16px;
      }
      md-outlined-select {
        min-width: auto;
      }
      .actions {
        margin-top: 16px;
      }
    `
  ]

  delete = async () => {
    const answer = await confirm('Are you sure you want to delete this item?')
    answer && this.remove()
  }

  scanBarcode = async (label) => {
    const scanner = document.querySelector('qrcode-scanner')
    const code = await scanner.scan()
    scanner.stop()

    this.field[label] = code
    this.requestRender()
  }

  render() {
    if (!this.field) return html``

    return html`
      <!-- Support new and old EAN-->

      <md-outlined-text-field
        required
        type="text"
        label="EAN"
        minLength="12"
        maxLength="13"
        value=${this.field.EAN}>
        <custom-icon-button
          @click=${() => this.scanBarcode('EAN')}
          slot="trailing-icon"
          icon="photo_camera"></custom-icon-button
      ></md-outlined-text-field>

      <flex-row>
        <md-outlined-text-field
          required
          type="number"
          label="amount"
          placeholder="500"
          value=${this.field.amount}>
        </md-outlined-text-field>

        <md-outlined-select
          required
          value=${this.field.unit}
          label="unit">
          <md-select-option value="kg">kg</md-select-option>
          <md-select-option value="g">g</md-select-option>
          <md-select-option value="mg">g</md-select-option>
          <md-select-option value="l">l</md-select-option>
          <md-select-option
            selected
            value="ml"
            >ml</md-select-option
          >
          <md-select-option value="cl">cl</md-select-option>
          <md-select-option value="pc">pc</md-select-option>
          <md-select-option value="pcs">pcs</md-select-option>
        </md-outlined-select>

        <md-outlined-text-field
          required
          type="number"
          label="price"
          placeholder="5"
          step="0.01"
          value=${this.field.price}>
        </md-outlined-text-field>

        <md-outlined-text-field
          required
          type="number"
          label="stock"
          placeholder="10"
          value=${this.field.stock}>
        </md-outlined-text-field>
      </flex-row>
      <flex-row
        center-center
        class="actions">
        <custom-icon-button
          @click=${this.delete}
          icon="delete"></custom-icon-button>
      </flex-row>
    `
  }
}
