import { customElement, property, html, css, LiteElement } from '@vandeurenglenn/lite'
import '@material/web/icon/icon.js'
import '@material/web/textfield/outlined-text-field.js'

@customElement('stock-item')
export class StockItem extends LiteElement {
  @property({ type: String, reflect: true })
  accessor key: string

  @property({ type: String })
  accessor stock: string

  @property({ type: String })
  accessor name: string

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
        --md-outlined-text-field-container-shape: var(--md-sys-shape-corner-medium);
      }
    `
  ]

  render() {
    console.log(this.stock)

    return html`
      <span class="body">${this.name}</span>
      ${this.stock
        ? html`
            <md-outlined-text-field
              type="number"
              .value=${this.stock}></md-outlined-text-field>
          `
        : ''}
    `
  }
}
