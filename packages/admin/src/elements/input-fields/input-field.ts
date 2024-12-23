import { LiteElement, customElement, property, query, html } from '@vandeurenglenn/lite'
import '@vandeurenglenn/lite-elements/toggle-button.js'
import '@material/web/field/outlined-field.js'

import '@vandeurenglenn/lite-elements/typography.js'
import '@lit-shop/translate/string.js'
import { StyleList, css } from '@vandeurenglenn/lite/element'

@customElement('input-field')
export class InputField extends LiteElement {
  @query('md-outlined-text-field')
  accessor input

  @property({ type: String })
  accessor name

  @property({ type: String })
  accessor value

  @property({ type: Boolean, attribute: 'is-check-box', reflect: true })
  accessor isCheckbox: boolean

  @property({ type: Boolean, attribute: 'is-info', reflect: true })
  accessor isInfo: boolean

  @property({ type: Boolean, attribute: 'is-select', reflect: true })
  accessor isSelect: boolean

  @property({ type: Array })
  accessor options

  @property({ type: Boolean }) accessor error

  checkValidity() {
    if (this.isCheckbox) return true
    if (this.isSelect) return this.shadowRoot.querySelector('md-outlined-select').checkValidity()
    if (this.isInfo) return true
    return this.input.checkValidity()
  }

  showError() {
    if (this.isCheckbox) return
    if (this.isSelect) return this.shadowRoot.querySelector('md-outlined-select').showError()
    if (this.isInfo) return
    this.input.showError()
  }

  async onChange(propertyKey: string, value: any) {
    if (propertyKey === 'value') {
      this.isCheckbox = this.value === 'false' || this.value === 'true'
    }
    if (propertyKey === 'name') {
      if (value === 'uniqueId' || value === 'sku') this.isInfo = true
    }

    if (value?.type && value?.options) {
      if (value.type === 'select') {
        this.isSelect = true
        this.options = value.options
      }
    }

    const selectEl = this.shadowRoot.querySelector('md-outlined-select')

    if (selectEl) {
      await selectEl.updateComplete
      this.value = value.value || this.options[0]
      selectEl.selectIndex(0)
      selectEl.addEventListener('value', (e) => {
        this.value = e.target.value
      })
    }
  }

  private _oninput = () => {
    this.value = this.input.value
  }

  static styles?: StyleList = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        width: 100%;
        margin-bottom: 16px;
      }

      :host([is-check-box]) {
        flex-direction: row;
        align-items: center;
      }
      :host([is-info]) {
        flex-direction: row;
        justify-content: space-between;
      }

      input {
        box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12),
          0 3px 1px -2px rgba(0, 0, 0, 0.2);
        border: 1px solid #38464e;

        padding: 12px 24px;
        box-sizing: border-box;
        border-radius: 12px;
        color: var(--md-sys-color-on-surface);
        background: transparent;
      }

      input {
        margin-top: 12px;
      }
    `
  ]

  renderInput() {
    return html`
      <md-outlined-text-field
        minLength="1"
        .error=${this.error}
        required
        error-text="${this.name} is required"
        type="text"
        value=${this.value}
        name=${this.name}
        label=${this.name}
        @input=${this._oninput}></md-outlined-text-field>
    `
  }

  renderCheckbox() {
    return html`
      <custom-typography
        type="label"
        size="large">
        <translated-string>${this.name}</translated-string>
      </custom-typography>
      <custom-toggle-button togglers='["check_box", "check_box_outline_blank"]'>
      </custom-toggle-button>
    `
  }

  renderInfo() {
    return html`
      <custom-typography
        type="label"
        size="large">
        <translated-string>${this.name}</translated-string>
      </custom-typography>
      <custom-typography
        type="label"
        size="large">
        ${this.value}
      </custom-typography>
    `
  }

  render() {
    if (!this.name) return html``
    if (this.isSelect) {
      if (!this.options) return html``
      return html`
        <md-outlined-select
          required
          label=${this.name}>
          ${this.options.map(
            (option, i) => html` <md-select-option value=${option}>${option}</md-select-option> `
          )}
        </md-outlined-select>
      `
    }
    if (this.isInfo) {
      return html` ${this.renderInfo()} `
    }
    return html`
      ${this.isCheckbox ? this.renderCheckbox() : !this.isInfo ? this.renderInput() : ''}
    `
  }
}
