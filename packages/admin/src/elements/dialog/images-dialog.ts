import { LiteElement, html, css, map, property, customElement, query } from '@vandeurenglenn/lite'
import { render } from 'lit-html'

import '@vandeurenglenn/lite-elements/dialog.js'
import '@vandeurenglenn/lite-elements/icon-button.js'
import '@vandeurenglenn/lite-elements/button.js'
import '@vandeurenglenn/lite-elements/tabs.js'
import '@vandeurenglenn/lite-elements/tab.js'

import '@material/web/button/filled-tonal-button.js'
import { MdFilledTextField } from '@material/web/textfield/filled-text-field.js'
import '@material/web/textfield/outlined-text-field.js'
import { imgurAlbumParams } from '@lit-shop/apis/imgur/types'
import { DeviceApi } from '@lit-shop/apis/device'
import '@material/web/progress/circular-progress.js'
import { imgurBaseImage } from '@lit-shop/apis/imgur-base'
import CameraPhoto from 'es-html5-camera-photo'

declare type actionResult = {
  action: string
  fields: imgurAlbumParams
  image?: { data: string | { name: string; data: string }[]; type: string }
}

declare global {
  interface HTMLElementTagNameMap {
    'images-dialog': ImagesDialog
  }
}

@customElement('images-dialog')
export class ImagesDialog extends LiteElement {
  deviceApi: DeviceApi = new DeviceApi()
  #cameraPhoto: CameraPhoto

  @query('custom-pages')
  accessor pages

  @property({ type: Array, consumes: true })
  accessor images: imgurBaseImage[]

  @property({ type: Boolean })
  accessor frontCameraDisabled: boolean = false

  @property({ type: Boolean })
  accessor rearCameraDisabled: boolean = false

  @property({ type: Boolean, reflect: true, attribute: 'has-library' })
  accessor hasLibrary: boolean = false

  static styles = [
    css`
      :host {
        display: block;
      }

      h5 {
        margin: 0;
      }

      custom-tab.custom-selected {
        background: var(--md-sys-color-tertiary);
        border: none;
      }

      custom-tab.custom-selected span,
      custom-tab.custom-selected md-icon {
        color: var(--md-sys-color-on-tertiary);
      }

      custom-tab {
        gap: 8px;
        height: 40px;
        padding: 0 12px;
        box-sizing: border-box;
        width: auto;
        border-radius: 20px;
        font: var(--_supporting-text-type);
        pointer-events: auto;
      }

      custom-tabs {
        height: 40px;
        pointer-events: auto;
      }

      section {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        min-height: 168px;
        position: absolute;
        transform: scale(0);
        justify-content: center;
        align-items: center;
      }

      section[route='camera'] {
        overflow-y: hidden;
      }

      section.custom-selected {
        transform: scale(1);
        position: relative;
      }
      md-outlined-text-field {
        padding-top: 12px;
      }

      .camera-actions {
        width: 100%;
        position: absolute;
        bottom: 0;
      }

      section[route='camera'] flex-container {
        height: 320px;
      }

      flex-column {
        width: auto;
      }

      flex-container video,
      img:not([data-variant='icon']) {
        height: -webkit-fill-available;
        width: -webkit-fill-available;
      }

      [data-variant='icon'] {
        height: 48px;
        width: 48px;
      }

      md-filled-text-field:not(first-child) {
        padding-top: 12px;
      }

      md-dialog {
        --_container-color: #2d2f31;
      }

      md-filled-text-field {
        --_container-color: #2d2f31;
      }
      [route='library'] img {
        width: 150px;
        cursor: pointer;
      }
    `
  ]

  get #dialog() {
    return this.shadowRoot.querySelector('custom-dialog')
  }

  get #cameraPreview() {
    return this.shadowRoot.querySelector('.camera-preview')
  }

  #cameraFacingMode = 'user'
  #image: { data: string | { name: string; data: string }[]; type: string } = {
    data: null,
    type: null
  }

  readAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.readAsDataURL(file)
    })
  }

  #takePhoto = async () => {
    // this._previewEl.stop();
    // this._previewEl.srcObject = null;
    const config = {
      sizeFactor: 1,
      imageType: 'png',
      imageCompression: 0,
      isImageMirror: false
    }

    let dataUri = this.#cameraPhoto.getDataUri(config)

    // const fd = new FormData();
    // fd.append('image', blob);

    this.#image.data = [{ name: new Date().getTime(), data: dataUri }]
    this.#image.type = 'base64[]'

    const img = document.createElement('img')
    img.src = this.#image.data[0].data as string
    this.shadowRoot
      .querySelector('flex-container')
      .replaceChild(img.cloneNode(true), this.#cameraPreview)
  }

  #selectFile = ({}) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true

    const onchange = async (event) => {
      console.log(event)
      console.log(input.files)

      const files = await Promise.all(
        Array.from(input.files).map(async (file) => {
          const data = await this.readAsDataURL(file)
          const item = document.createElement('md-list-item')
          item.headline = file.name
          item.setAttribute('noninteractive', '')
          item.innerHTML = `
          <img data-variant="icon" slot="start" src="${data}">
          <custom-icon-button slot="end" icon="delete"></custom-icon-button>
        `
          item.onclick = () => {
            this.shadowRoot.querySelector('section[route="file"]').removeChild(item)
          }
          this.shadowRoot.querySelector('section[route="file"]').appendChild(item)
          return { name: file.name, data }
        })
      )

      this.#image.data = files as { name: string; data: string }[]
      this.#image.type = 'base64[]'
      input.removeEventListener('change', onchange)
    }

    input.addEventListener('change', onchange)

    input.click()
  }

  #onlibclick = (event, hash) => {
    console.log(hash)

    this.#image.data = hash
    this.#image.type = 'library'
  }

  #onSelected = async ({ detail }) => {
    this.shadowRoot.querySelector('custom-pages').select(detail)
    if (detail === 'camera') {
      this.frontCameraDisabled = !(await this.deviceApi.hasFrontCam())
      this.rearCameraDisabled = !(await this.deviceApi.hasBackCam())
      // get your video element with his corresponding id from the html
      let videoElement = document.getElementById('videoId')

      // pass the video element to the constructor.
      this.#cameraPhoto = new CameraPhoto(this.#cameraPreview)
      const stream = await this.#cameraPhoto.startCamera(this.#cameraFacingMode, {
        width: 3840,
        height: 3840
      })

      // this.deviceApi.camera.preview(this.#cameraPreview, this.#cameraFacingMode)
    }
  }

  #addImageTemplate() {
    console.log(this.images)

    return html`
      <custom-tabs
        slot="header"
        attr-for-selected="route"
        @selected=${this.#onSelected}>
        ${this.hasLibrary
          ? html`
              <custom-tab route="library">
                <md-icon>photo_library</md-icon>
                <span>library</span>
              </custom-tab>
            `
          : ''}
        <custom-tab route="url">
          <md-icon>link</md-icon>
          <span>url</span>
        </custom-tab>
        <flex-it flex="1"></flex-it>

        <custom-tab route="camera">
          <md-icon>camera</md-icon>
          <span>camera</span>
        </custom-tab>
        <flex-it flex="1"></flex-it>

        <custom-tab route="file">
          <md-icon>upload</md-icon>
          <span>file</span>
        </custom-tab>
        <flex-it flex="2"></flex-it>
      </custom-tabs>

      <custom-pages
        attr-for-selected="route"
        selected="0">
        ${this.hasLibrary
          ? html`
              <section route="library">
                <flex-wrap-around>
                  ${map(
                    this.images,
                    (image: imgurBaseImage) => html`
                      <img
                        @click=${(event) => this.#onlibclick(event, image.key)}
                        src=${`${location.origin}/api/image?image=${image.link.replace(
                          '.png',
                          's.png'
                        )}`} />
                    `
                  )}
                </flex-wrap-around>
              </section>
            `
          : ''}
        <section route="url">
          <flex-column>
            add image using a link/url
            <md-outlined-text-field
              label="url"
              input-field="url"></md-outlined-text-field>
          </flex-column>
        </section>

        <section route="camera">
          <flex-container>
            add image using a camera
            <video
              autoplay
              mute="true"
              class="camera-preview"></video>
          </flex-container>

          <flex-row class="camera-actions">
            <flex-it flex="2"></flex-it>

            <custom-icon-button
              @click=${() => (this.#cameraFacingMode = 'user')}
              ?disabled=${this.frontCameraDisabled}
              icon="photo_camera_front">
            </custom-icon-button>

            <flex-it flex="1"></flex-it>

            <custom-icon-button
              style="transform: scale(1.66);"
              @click=${this.#takePhoto}
              icon="photo_camera">
            </custom-icon-button>

            <flex-it flex="1"></flex-it>

            <custom-icon-button
              @click=${() => (this.#cameraFacingMode = 'environment')}
              ?disabled=${async () => !(await this.deviceApi.hasBackCam())}
              icon="photo_camera_back">
            </custom-icon-button>

            <flex-it flex="2"></flex-it>
          </flex-row>
        </section>

        <section route="file">
          add image uploading a file
          <filled-tonal-button @click=${this.#selectFile}>
            <md-icon slot="icon">upload</md-icon>
            select
          </filled-tonal-button>
        </section>
      </custom-pages>

      <flex-row slot="actions">
        <custom-button
          action="cancel"
          label="cancel"></custom-button>
        <flex-one></flex-one>
        <custom-button
          action="submit"
          label="submit"
          type="tonal"></custom-button>
      </flex-row>
    `
  }

  #areYouSureDialogTemplate(deletehash, type: string = 'album') {
    return html`
      <flex-row
        slot="header"
        center>
        <h5>remove ${type}</h5>
        <flex-it></flex-it>
        <custom-icon-button
          value="close"
          icon="close">
        </custom-icon-button>
      </flex-row>

      <form id="content-form">
        <strong
          >Are you sure you want to remove
          <span
            class="deletehash"
            deletehash=${deletehash}
            >${deletehash}</span
          >?</strong
        >
      </form>

      <flex-row slot="actions">
        <custom-button
          form="content-form"
          action="cancel"
          label="cancel"></custom-button>
        <flex-one></flex-one>
        <custom-button
          form="content-form"
          action="submit"
          label="submit"
          type="tonal"></custom-button>
      </flex-row>
    `
  }

  #createAlbumDialogTemplate() {
    return html`
      <flex-row
        slot="header"
        center>
        <custom-typography type="headline">create album</custom-typography>
        <flex-it></flex-it>
        <custom-icon-button icon="close"> </custom-icon-button>
      </flex-row>

      <flex-column>
        <md-filled-text-field
          label="title"
          input-field></md-filled-text-field>
        <md-filled-text-field
          label="description"
          input-field></md-filled-text-field>
      </flex-column>

      <flex-row slot="actions">
        <custom-button
          action="cancel"
          label="cancel"></custom-button>
        <flex-one></flex-one>
        <custom-button
          action="submit"
          label="submit"></custom-button>
      </flex-row>
    `
  }

  #onAction = (): Promise<actionResult> =>
    new Promise((resolve, reject) => {
      const action = ({ detail }) => {
        console.log({ detail })

        const inputFields = Array.from(
          this.shadowRoot.querySelectorAll('[input-field]')
        ) as MdFilledTextField[]
        const fields = {}

        for (const field of inputFields) {
          fields[field.label] = field.value
        }

        if (!this.#image.type) {
          const inputField = this.shadowRoot.querySelector('[input-field]') as HTMLInputElement
          this.#image.type = inputField ? 'url' : undefined
          this.#image.data = inputField?.value
        }

        const image = {
          type: this.#image.type,
          data: Array.isArray(this.#image.data) ? [...this.#image.data] : this.#image.data
        }

        console.log({ fields, image, action: detail })

        resolve({ fields, image, action: detail })

        // @ts-ignore
        this.#dialog.removeEventListener('close', action)

        this.#image.data = null
        this.#image.type = null

        this.deviceApi.camera.close()
        render(html``, this.#dialog)
      }

      // @ts-ignore
      this.#dialog.addEventListener('close', action)
    })

  #busytemplate(title, description) {
    return html`
      <flex-row slot="headline">
        <h5>${title}</h5>
      </flex-row>

      <flex-column slot="content"> ${description} </flex-column>

      <flex-row
        slot="actions"
        style="justify-content: center; width: 100%;">
        <md-circular-progress indeterminate></md-circular-progress>
      </flex-row>
    `
  }

  #removeOriginalTemplate() {
    return html`
      <flex-row slot="header">
        <h5>Keep the original</h5>
        <flex-one></flex-one>
        <custom-icon-button
          value="close"
          icon="close">
        </custom-icon-button>
      </flex-row>

      <flex-column>
        <strong>Keep or remove the original image?</strong>
      </flex-column>

      <flex-row slot="actions">
        <custom-button
          action="remove"
          label="remove"></custom-button>
        <flex-one></flex-one>
        <custom-button
          action="close"
          label="keep"></custom-button>
      </flex-row>
    `
  }

  async createAlbum(): Promise<actionResult> {
    render(this.#createAlbumDialogTemplate(), this.#dialog)
    this.#dialog.open = true
    return this.#onAction()
  }

  // @ts-ignore
  async removeAlbum(deletehash): Promise<actionResult> {
    render(this.#areYouSureDialogTemplate(deletehash), this.#dialog)
    this.#dialog.open = true
    return this.#onAction()
  }

  async addImage() {
    render(this.#addImageTemplate(), this.#dialog)
    this.#dialog.open = true
    return this.#onAction()
  }

  async removeImage(deletehash): Promise<actionResult> {
    render(this.#areYouSureDialogTemplate(deletehash, 'image'), this.#dialog)
    this.#dialog.open = true
    return this.#onAction()
  }

  removeImageFromProduct(id) {
    render(this.#areYouSureDialogTemplate(id, 'image'), this.#dialog)
    this.#dialog.open = true
    return this.#onAction()
  }

  async removeOriginal() {
    render(this.#removeOriginalTemplate(), this.#dialog)
    this.#dialog.open = true
    return this.#onAction()
  }

  async busy(title, description?) {
    render(this.#busytemplate(title, description), this.#dialog)
    this.#dialog.open = true
  }

  close() {
    this.#dialog.open = false
  }

  render() {
    return html` <custom-dialog></custom-dialog> `
  }
}
