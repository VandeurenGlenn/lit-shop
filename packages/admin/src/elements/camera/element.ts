import { css, customElement, html, LiteElement, property } from '@vandeurenglenn/lite'
import CameraPhoto from 'es-html5-camera-photo'
import { DeviceApi } from '@lit-shop/apis/device'

@customElement('camera-element')
export class CameraElement extends LiteElement {
  #cameraPhoto
  @property({ type: Boolean, reflect: true, attribute: 'front-camera-disabled' })
  accessor frontCameraDisabled
  @property({ type: Boolean, reflect: true, attribute: 'rear-camera-disabled' })
  accessor rearCameraDisabled

  @property({ type: Boolean, reflect: true }) accessor open

  static styles = [
    css`
      :host {
        display: block;
      }
    `
  ]

  async firstRender(): void {
    this.deviceApi = new DeviceApi()
    this.frontCameraDisabled = !(await this.deviceApi.hasFrontCam())
    this.rearCameraDisabled = !(await this.deviceApi.hasBackCam())
    // get your video element with his corresponding id from the html

    // pass the video element to the constructor.
    this.#cameraPhoto = new CameraPhoto(this.shadowRoot.querySelector('video'))
    const stream = await this.#cameraPhoto.startCamera(
      this.rearCameraDisabled ? 'user' : 'environment',
      {
        width: 3840,
        height: 3840
      }
    )
  }

  takePhoto() {
    const config = {
      sizeFactor: 1,
      imageType: 'png',
      imageCompression: 0,
      isImageMirror: false
    }

    let dataUri = this.#cameraPhoto.getDataUri(config)
    return dataUri
  }

  render() {
    return html`
      <video
        autoplay
        mute="true"></video>
      <camera-actions></camera-actions>
    `
  }
}
