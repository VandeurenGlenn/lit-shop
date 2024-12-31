import { customElement, property, html, css, LiteElement } from '@vandeurenglenn/lite'
import '@material/web/icon/icon.js'
import '@vandeurenglenn/lite-elements/icon-button.js'

@customElement('qrcode-item')
export class QrcodeItem extends LiteElement {
  @property({ type: String }) accessor qrcode: string
  @property({ type: Boolean }) accessor editMode: boolean
  @property({ type: String, reflect: true }) accessor key: string
  @property({ type: Boolean, reflect: true }) accessor viewMode: boolean

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

  async generateQRCodeWithImage(size = 1240): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const context = canvas.getContext('2d')
    return new Promise(async (resolve) => {
      const response = await fetch(`/api/generate-qrcode?text=${this.qrcode}`)
      const text = await response.text()

      const dataURI = 'data:image/svg+xml;base64,' + btoa(text)

      var image = new Image()
      image.crossOrigin = 'Anonymous'
      const logo = new Image()
      logo.crossOrigin = 'Anonymous'
      image.onload = function () {
        logo.onload = function () {
          let wrh = image.width / image.height
          let newWidth = canvas.width
          let newHeight = newWidth / wrh
          if (newHeight > canvas.height) {
            newHeight = canvas.height
            newWidth = newHeight * wrh
          }
          let xOffset = newWidth < canvas.width ? (canvas.width - newWidth) / 2 : 0
          let yOffset = newHeight < canvas.height ? (canvas.height - newHeight) / 2 : 0
          context.drawImage(image, xOffset, yOffset, newWidth, newHeight)

          context.fillStyle = '#000'
          const rectSize = canvas.width / 6.2
          context.fillRect(canvas.width / 2 - rectSize / 2, canvas.height / 2 - rectSize / 2, rectSize, rectSize)
          context.strokeStyle = '#000'
          context.lineWidth = 2
          const logoSize = canvas.width / 13
          context.drawImage(logo, canvas.width / 2 - logoSize / 2, canvas.height / 2 - logoSize / 2, logoSize, logoSize)
          resolve(canvas)
        }

        logo.src = 'https://hellonewme.be/assets/sciccors-dark.svg'
      }

      image.src = dataURI
    })
  }

  save() {
    this.editMode = false
    this.qrcode = this.shadowRoot.querySelector('md-outlined-text-field').value
    firebase.set(`qrcodes/${this.key}`, this.qrcode)
  }

  async remove() {
    const answer = confirm('Are you sure you want to delete this qrcode?')
    if (!answer) return
    await firebase.remove(`qrcodes/${this.key}`)
  }

  async download() {
    const canvas = await this.generateQRCodeWithImage()
    console.log(canvas)
    canvas.classList.add('view')
    canvas.toBlob(
      (blob) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${this.qrcode}.png`
        a.click()
        URL.revokeObjectURL(url)
      },
      'image/png',
      100
    )
  }

  async view() {
    this.viewMode = true
    const canvas = await this.generateQRCodeWithImage(320)

    const view = document.createElement('div')
    const backdrop = document.createElement('div')
    view.classList.add('view')
    backdrop.classList.add('backdrop')
    document.body.appendChild(backdrop)
    view.appendChild(canvas)
    document.body.insertBefore(view, document.body.firstChild)

    view.onclick = () => {
      document.body.removeChild(view)
      document.body.removeChild(backdrop)
      this.viewMode = false
    }
  }

  render() {
    return html`
      ${this.editMode
        ? html` <md-outlined-text-field
              type="text"
              .value=${this.qrcode}></md-outlined-text-field>
            <flex-row>
              <custom-icon-button
                icon="save"
                @click=${() => this.save()}></custom-icon-button>
            </flex-row>`
        : html`<span class="body">${this.qrcode}</span>
            <flex-row>
              <custom-icon-button
                icon="view"
                @click=${() => this.view()}></custom-icon-button>
              <custom-icon-button
                icon="download"
                @click=${() => this.download()}></custom-icon-button>
              <custom-icon-button
                icon="edit"
                @click=${() => (this.editMode = true)}></custom-icon-button>
              <custom-icon-button
                icon="delete"
                @click=${() => this.remove()}></custom-icon-button>
            </flex-row>`}
    `
  }
}
