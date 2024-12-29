import { LiteElement, html, css, customElement, property, queryAll } from '@vandeurenglenn/lite'
import '@vandeurenglenn/flex-elements/row.js'
import './size-field.js'
import { SizeField } from './size-field.js'

@customElement('size-fields')
export class SizeFields extends LiteElement {
  @property({ type: Array })
  accessor fields: { price: number; size: number; stock: number; unit: string; EAN: string }[]

  addSize() {
    const field = {}
    if (!this.fields) this.fields = [field]
    else this.fields.push(field)
    this.requestRender()
  }

  getValues() {
    const values = []
    const sizeFields = Array.from(this.shadowRoot.querySelectorAll('size-field')) as SizeField[]
    for (const field of sizeFields) {
      values.push(field.field)
    }
    return values
  }

  checkValidityAndGetValues() {
    const fields = Array.from(this.shadowRoot.querySelectorAll('size-field')) as SizeField[]
    const values = []

    let error = false
    for (const field of fields) {
      if (!field.checkValidity()) {
        error = true
        field.error = true
      }
      values.push(field.field)
    }
    return { error, values }
  }

  reset() {
    this.fields = []
  }

  static styles = [
    css`
      :host {
        width: 100%;
      }
    `
  ]

  _removeField(EAN) {
    let index
    for (let i = 0; i < this.fields.length; i++) {
      if (this.fields[i].EAN === EAN) {
        index = i
        break
      }
    }
    this.fields
  }

  render() {
    return html`
      ${this.fields
        ? this.fields.map(
            (field) => html`
              <size-field
                @click=${() => this._removeField(field.EAN)}
                .field=${field}></size-field>
            `
          )
        : ''}

      <flex-row
        class="wrapper"
        center-center>
        <custom-icon-button
          icon="add"
          title="add info field"
          @click=${() => this.addSize()}></custom-icon-button>
      </flex-row>
    `
  }
}
