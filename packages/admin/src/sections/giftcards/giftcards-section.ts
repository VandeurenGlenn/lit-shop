import { LiteElement, customElement, css, html, property } from '@vandeurenglenn/lite'
import '@material/web/fab/fab.js'
import '@vandeurenglenn/flex-elements/container.js'
import '@vandeurenglenn/lite-elements/icon.js'
import base32 from '@vandeurenglenn/base32'
import type { Giftcard } from '@lit-shop/types'
import './../../elements/items/giftcard-item.js'
@customElement('giftcards-section')
export class GiftcardsSection extends LiteElement {
  @property({ type: Array, consumes: 'giftcards' }) accessor giftcards
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

      flex-container {
        gap: 8px;
      }
    `
  ]

  render() {
    return html`
      ${this.giftcards
        ? html`
            <flex-container>
              ${Object.entries(this.giftcards).map(
                ([key, giftcard]) => html`<giftcard-item .giftcard=${giftcard}></giftcard-item>`
              )}
            </flex-container>
          `
        : ''}
      <md-fab @click=${() => this.addGiftcard()}>
        <custom-icon
          slot="icon"
          icon="add"></custom-icon
      ></md-fab>
    `
  }

  addGiftcard = async () => {
    const value = prompt('gift card amount', '100')
    if (!value) return
    const giftcardUID = crypto.getRandomValues(new Uint8Array(32))
    const uuid = `${base32.encode(new TextEncoder().encode(value))}-${base32.encode(giftcardUID)}`

    console.log(uuid)

    const response = await fetch(`/api/generate-qrcode?text=${encodeURIComponent(uuid)}`)
    if (response.status !== 200) return alert('Failed to generate QR code')
    // const text = await response.text()

    // const qrcode = 'data:image/svg+xml;base64,' + btoa(text)

    const giftcard: Omit<Giftcard, 'redeemedAt' | 'redeemBy' | 'updatedAt'> = {
      amount: value,
      status: 'active',
      createdAt: Date.now(),
      paymentType: null,
      paymentId: null,
      uuid
    }

    await firebase.set(`giftcards/${uuid}`, giftcard)
  }
}
