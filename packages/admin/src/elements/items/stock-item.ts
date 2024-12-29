import { customElement, property, html, css, LiteElement } from '@vandeurenglenn/lite'
import '@material/web/icon/icon.js'
import '@material/web/textfield/outlined-text-field.js'

@customElement('stock-item')
export class StockItem extends LiteElement {
  @property({ type: String, reflect: true })
  accessor key: string

  @property({ type: String, reflect: true, attribute: 'size-key' })
  accessor sizeKey: string

  @property({ type: String })
  accessor stock: string

  @property({ type: String })
  accessor name: string

  @property({ type: Boolean })
  accessor editMode: boolean

  static styles = [
    css`
      :host {
        display: flex;
        flex-direction: row;
        pointer-events: auto;
        background: var(--md-sys-color-surface-variant);
        align-items: center;
        padding-left: 24px;
        box-sizing: border-box;
        width: 100%;
        height: 48px;
        border-radius: var(--md-sys-shape-corner-large);
      }

      custom-icon[public] {
        --custom-icon-color: #4caf50;
      }

      .body {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: inline-block;
        width: 100%;
        min-width: 0;
      }

      md-outlined-text-field {
        height: 48px;
        --md-outlined-text-field-container-shape: var(--md-sys-shape-corner-medium);
      }

      .stock {
        margin-left: auto;
        margin-right: 24px;
      }
    `
  ]

  render() {
    return html`
      <span class="body">${this.name}</span>
      ${this.stock !== undefined && !this.editMode
        ? html`<span class="stock">${this.stock}</span> `
        : this.stock !== undefined && this.editMode
        ? html`<md-outlined-text-field
            type="number"
            @input=${(e: any) => (this.stock = e.target.value)}
            .value=${this.stock}></md-outlined-text-field>`
        : ''}
    `
  }
}
