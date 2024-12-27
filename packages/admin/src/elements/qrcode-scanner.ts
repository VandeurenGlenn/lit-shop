import { DeviceApi } from '@lit-shop/apis/device'
import { css, html, LiteElement, query, customElement, property } from '@vandeurenglenn/lite'

// import { Html5QrcodeResult } from 'html5-qrcode'
// import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode'

@customElement('qrcode-scanner')
export class QRCodeScanner extends LiteElement {
  @property({ type: Boolean, reflect: true }) accessor scanning
  static styles = [
    css`
      :host {
        position: absolute;
        display: block;
        inset: 0;
        opacity: 0;
        pointer-events: none;
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
    `
  ]

  reader

  connectedCallback(): void {
    this.innerHTML = '<div id="reader"></div>'

    this.reader = new Html5Qrcode('reader')
    console.log(this.reader)
  }

  async scan() {
    return new Promise(async (resolve) => {
      this.scanning = true
      const config = {
        fps: 10,
        qrbox: {
          width: 500,
          height: 500
        }
      }
      const qrCodeSuccessCallback = (decodedText: string) => {
        // handle the scanned code as you like
        if (decodedText && decodedText.length === 13) {
          resolve(decodedText)
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

  stop() {
    this.reader.stop()
    this.scanning = false
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qrcode-scanner': QRCodeScanner
  }
}
