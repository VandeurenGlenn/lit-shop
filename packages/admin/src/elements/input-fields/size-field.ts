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
import './../camera/element.js'
import './../qrcode-scanner.js'
// import * as Quagga from '@ericblade/quagga2/'

@customElement('size-field')
export class SizeField extends LiteElement {
  @property({ type: Number })
  accessor size

  @property({ type: Number })
  accessor price

  @property({ type: Number }) accessor stock

  @property({ type: String }) accessor unit

  @property({ type: String }) accessor EAN

  @property({ type: Boolean }) accessor error

  @property({ type: Boolean, reflect: true }) accessor scanning

  @queryAll('md-outlined-text-field') accessor fields

  @query('camera-element') accessor cameraElement

  async firstRender(): Promise<void> {
    const fields = Array.from(
      this.shadowRoot.querySelectorAll('md-outlined-text-field')
    ) as MdOutlinedTextField[]
    fields.forEach(async (field) => {
      await field.updateComplete
      console.log(this[field.label])

      // if (!this[field.label]) this[field.label] = field.placeholder
      field.addEventListener('input', () => this._oninput(field))
    })
    const select = this.shadowRoot.querySelector('md-outlined-select')
    await select.updateComplete
    this.unit = select.value
    select.addEventListener('input', (e) => {
      this.unit = select.value
    })
  }

  private _oninput = (field) => {
    console.log(field.label)

    debounce(() => {
      this[field.label] = field.value
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
        pointer-events: none;
      }

      md-outlined-text-field[label='EAN'] {
        margin-bottom: 16px;
      }

      .scanner {
        opacity: 0;
        pointer-events: none;
        position: absolute;
        inset: 0;
        display: block;
      }

      :host([scanning]) .scanner {
        opacity: 1;
        pointer-events: auto;
      }
    `
  ]

  async scan(dataURI) {
    console.log(Quagga)

    const result = await Quagga.decodeSingle({
      decoder: {
        readers: ['ean_reader'] // List of active readers
      },
      locate: true, // try to locate the barcode in the image
      src: dataURI // or 'data:image/jpg;base64,' + data
    })
    console.log(result)

    return result
  }

  scanBarcode = async (label) => {
    console.log('scanning')
    console.log(event)

    // this.scanning = true
    const scanner = document.querySelector('qrcode-scanner')
    const code = await scanner.scan()
    scanner.stop()
    this.shadowRoot.querySelector(`[label="${label}"]`).value = code
  }

  render() {
    return html`
      <!-- Support new and old EAN-->

      <md-outlined-text-field
        required
        type="text"
        label="EAN"
        minLength="12"
        maxLength="13"
        value=${this.EAN}>
        <custom-icon-button
          @click=${() => this.scanBarcode('EAN')}
          slot="trailing-icon"
          icon="photo_camera"></custom-icon-button
      ></md-outlined-text-field>

      <flex-row>
        <md-outlined-text-field
          required
          type="number"
          label="size"
          placeholder="500"
          value=${this.size}>
        </md-outlined-text-field>

        <md-outlined-select
          required
          value=${this.unit}
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
        </md-outlined-select>

        <md-outlined-text-field
          required
          type="number"
          label="price"
          placeholder="5"
          step="0.01"
          value=${this.price}>
        </md-outlined-text-field>

        <md-outlined-text-field
          required
          type="number"
          label="stock"
          placeholder="10"
          value=${this.stock}>
        </md-outlined-text-field>
      </flex-row>
    `
  }
}
