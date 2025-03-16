import { customElement, property, html, css, LiteElement } from '@vandeurenglenn/lite'
import '@material/web/icon/icon.js'
import '@material/web/iconbutton/filled-icon-button.js'

@customElement('product-item')
export class ProductItem extends LiteElement {
  @property({ type: String, reflect: true })
  accessor key: string

  @property({ type: String, reflect: true })
  accessor draggable

  @property({ type: String })
  accessor name: string

  @property({ type: String, reflect: true })
  accessor public: string

  async connectedCallback() {
    this.ondragstart = this.#ondragstart.bind(this)
    this.draggable = 'true'
  }

  #ondragstart(event) {
    event.dataTransfer.dropEffect = 'move'
    event.dataTransfer.setData('text', this.key)
  }

  private _publicClicked(event) {
    console.log('click')
    event.stopImmediatePropagation()
    event.stopPropagation()
    const bool = this.public === 'true'
    this.public = String(!bool)
    console.log(this.public)
    console.log(this.key)

    firebase.update(`products/${this.key}`, { public: this.public })
  }

  static styles = [
    css`
      :host {
        display: block;
      }

      custom-icon[public] {
        --custom-icon-color: #4caf50;
      }

      a {
        display: flex;
        align-items: center;
        text-decoration: none;
        pointer-events: auto !important;
        background: var(--md-sys-color-surface-variant);
        padding: 12px 24px;
        width: 100%;
        box-sizing: border-box;
        border-radius: var(--md-sys-shape-corner-large);

        color: var(--md-sys-color-on-surface-variant);
      }

      .body {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: inline-block;
        width: 100%;
        min-width: 0;
      }
    `
  ]

  render() {
    return html`
      <a href="#!/catalog/product?selected=${this.key}">
        <span class="body">${this.name}</span>
        ${this.renderHeadline(item)}
        <slot name="end"></slot>
      </a>
    `
  }
}
