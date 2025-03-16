import { DeviceApi } from '@lit-shop/apis/device'
import { css, html, LiteElement, query, customElement, property } from '@vandeurenglenn/lite'

// import { Html5QrcodeResult } from 'html5-qrcode'
// import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode'

import { Html5Qrcode } from 'html5-qrcode'

@customElement('qrcode-scanner')
export class QRCodeScanner extends LiteElement {
  _reject
  @property({ type: Boolean, reflect: true }) accessor scanning
  static styles = [
    css`
      :host {
        position: absolute;
        display: block;
        inset: 0;
        opacity: 0;
        pointer-events: none;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 10001;
        align-content: center;
        justify-items: center;
        display: grid;
      }

      ::slotted(*) {
        opacity: 0;
        pointer-events: none;
      }

      :host([scanning]),
      :host([scanning]) ::slotted(*) {
        opacity: 1;
        pointer-events: auto;
      }

      ::slotted(*) {
        height: 100%;
        width: 100%;
      }
      custom-icon-button {
        position: absolute;
        top: 24px;
        right: 24px;
      }
    `
  ]

  reader

  render() {
    return html`<slot></slot
      ><custom-icon-button
        icon="close"
        @click=${() => this.stop('close')}></custom-icon-button> `
  }

  firstRender(): void {
    this.innerHTML = '<div id="reader"></div>'

    this.reader = new Html5Qrcode('reader')
  }

  async scan(onscan?: (result: string) => boolean): Promise<string> {
    return new Promise(async (resolve, reject) => {
      this.scanning = true
      const config = {
        fps: 10,
        qrbox: {
          width: 320,
          height: 500
        }
      }
      this._reject = reject

      const qrCodeSuccessCallback = (decodedText: string) => {
        // handle the scanned code as you like
        if (onscan) {
          const scanResult = onscan(decodedText)
          if (scanResult) {
            resolve(decodedText)
            this.stop()
          }
        } else if (decodedText) {
          resolve(decodedText)
          this.stop()
        }
      }

      // If you want to prefer front camera
      const hasBackCam = await DeviceApi.hasBackCam()

      if (hasBackCam) {
        this.reader.start({ facingMode: 'environment' }, config, qrCodeSuccessCallback)
      } else {
        this.reader.start({ facingMode: 'user' }, config, qrCodeSuccessCallback)
      }
    })
  }

  stop = (reason?) => {
    console.log('stop')

    this.reader.stop()
    this.scanning = false
    if (reason) this._reject(reason)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qrcode-scanner': QRCodeScanner
  }
}
