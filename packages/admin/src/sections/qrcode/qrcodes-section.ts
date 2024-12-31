import { html, css, LiteElement, property, customElement } from '@vandeurenglenn/lite'
import './../../elements/items/qrcode-item.js'
import '@material/web/fab/fab.js'
import '@vandeurenglenn/flex-elements/container.js'
import '@vandeurenglenn/lite-elements/icon.js'

@customElement('qrcodes-section')
export class QrcodesSection extends LiteElement {
  @property({ type: Array, consumes: 'qrcodes' }) accessor qrcodes: string[]

  static styles = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        justify-content: center;
        align-items: center;
      }
      md-fab {
        position: fixed;
        bottom: 24px;
        right: 24px;
      }
    `
  ]

  async addQrcode() {
    const value = prompt('Add QR code')
    if (!value) return
    const qrcodes = this.qrcodes || []

    this.qrcodes.push(value)
    const index = this.qrcodes.indexOf(value)
    await firebase.set(`qrcodes/${index}`, value)
  }

  async removeQrcode(qrcode) {
    const index = this.qrcodes.indexOf(qrcode)
    if (!confirm('Are you sure you want to delete this QR code?')) return
    if (index !== -1) {
      this.qrcodes.splice(index, 1)
      await firebase.update('qrcodes', this.qrcodes)
    }
  }

  render() {
    if (this.qrcodes === undefined) return html`<p>Loading...</p>`

    return html`
      <flex-container>
        ${this.qrcodes
          ? this.qrcodes.map((qrcode) => html` <qrcode-item .qrcode=${qrcode}></qrcode-item> `)
          : html`<p>No QR codes</p>`}
      </flex-container>
      <md-fab @click=${() => this.addQrcode()}
        ><custom-icon
          slot="icon"
          icon="add"></custom-icon
      ></md-fab>
    `
  }
}
