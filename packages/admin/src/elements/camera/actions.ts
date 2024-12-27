import { customElement, html, LiteElement } from '@vandeurenglenn/lite'

@customElement('camera-actions')
export class CameraActions extends LiteElement {
  _onClick(event) {
    console.log(event)
  }

  firstRender(): void {
    this.shadowRoot.addEventListener('click', this._onClick)
  }
  render() {
    return html` <custom-icon-button icon="photo_camera"></custom-icon-button> `
  }
}
