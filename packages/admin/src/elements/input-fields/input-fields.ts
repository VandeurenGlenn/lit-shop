import { LiteElement, html, css, customElement, property } from '@vandeurenglenn/lite'
import '@vandeurenglenn/flex-elements/row.js'
import './input-field.js'
import { InputField } from './input-field.js'

@customElement('input-fields')
export class InputFields extends LiteElement {
  @property({ type: Array })
  accessor fields

  async addField() {
    const name = await prompt('please enter field name')
    if (name) {
      this.fields.push([name, ''])
      this.requestRender()
    }
  }

  static styles = [
    css`
      :host {
        width: 100%;
      }
    `
  ]

  getValues() {
    const fields = Array.from(this.shadowRoot.querySelectorAll('input-field')) as InputField[]
    const values = {}

    for (const field of fields) {
      values[field.name] = field.value
    }
    return values
  }

  checkValidityAndGetValues() {
    const fields = Array.from(this.shadowRoot.querySelectorAll('input-field')) as InputField[]
    const values = {}

    let error = false
    for (const field of fields) {
      if (!field.checkValidity()) {
        error = true
        field.error = true
      }
      values[field.name] = field.value
    }
    return { error, values }
  }

  render() {
    return html`
      ${this.fields
        ? this.fields.map(
            (field) => html`
              <input-field
                .name=${field[0]}
                .value=${field[1]}></input-field>
            `
          )
        : ''}

      <flex-row
        class="wrapper"
        center-center>
        <custom-icon-button
          icon="add"
          title="add info field"
          @click=${() => this.addField()}></custom-icon-button>
      </flex-row>
    `
  }
}
