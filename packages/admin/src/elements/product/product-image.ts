import { LiteElement, property, html, css, customElement } from '@vandeurenglenn/lite'
import './../dialog/images-dialog.js'

@customElement('product-image')
export class ProductImage extends LiteElement {
  @property({ type: Object }) accessor image

  @property({ type: String }) accessor productKey

  delete = async () => {
    const dialog = document.createElement('images-dialog')
    document.body.appendChild(dialog)

    const result = await dialog.removeImageFromProduct(this.image.key)
    if (result.action !== 'submit') return

    const images = await firebase.get(`products/${this.productKey}/images`)

    images.splice(images.indexOf(this.image.key), 1)
    await firebase.set(`products/${this.productKey}/images`, images)
    this.remove()
  }

  static styles = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        width: 300px;
        height: 300px;
        position: relative;
        border: 1px solid rgb(85, 85, 85);
      }

      img {
        height: calc(100% - 48px);
      }

      .toolbar {
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        width: 100%;
        background: rgba(0, 0, 0, 0.5);
      }
    `
  ]

  render(): import('lit-html').TemplateResult<1> {
    return html`
      ${this.image
        ? html` <img
              src=${`api/image?image=${this.image.link.replace('.png', 'm.png')}`}
              alt=${this.image.title} />
            <flex-row class="toolbar">
              <custom-icon-button
                icon="delete"
                @click=${this.delete}>
              </custom-icon-button>
            </flex-row>`
        : ''}
    `
  }
}
