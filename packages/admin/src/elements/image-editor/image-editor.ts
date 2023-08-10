
import { customElement, property } from 'lit/decorators.js'
import { css, html } from '@vandeurenglenn/lit-elements/helpers.js';

import Cropper from './../../../../../node_modules/cropperjs/dist/cropper.esm.js'

export declare type ImageEditorAction = 'done' | 'cancel'
@customElement('image-editor')
export class ImageEditor extends HTMLElement {

  cropper: Cropper
  
  set image(value) {
    this.cropper.replace(value)
  }

  set open(value) {
    if (value) this.setAttribute('open', '')
    else this.removeAttribute('open')
  }

  toDataURL() {
    return this.cropper.getCroppedCanvas().toDataURL()
  }

  show(image: string): Promise<{action: ImageEditorAction, image?: string}> {
    if (image) this.image = image
    this.open = true
    return new Promise((resolve, reject) => {
      onclick = (event) => {
        const target = event.composedPath()[0] as HTMLElement
        const action = target.getAttribute('action') as ImageEditorAction
        if (action) {
          let image
          if (action === 'done') image = this.toDataURL()
          this.open = false
          resolve({action, image})
        }
      }
      this.shadowRoot.querySelector('.actions').addEventListener('click', onclick)
    })
  }

  constructor() {
    super()
    this.attachShadow({mode: 'open'})
    this.shadowRoot.innerHTML = this.render()

    const sheets = []
    for (const style of ImageEditor.styles) {
      const sheet = new CSSStyleSheet()
      sheet.replaceSync(style)
      sheets.push(sheet)
    }
    this.shadowRoot.adoptedStyleSheets = sheets

    this.cropper = new Cropper(this.shadowRoot.querySelector('img'), {
      ready: function (event) {
        // this.cropper.zoomTo(1)

        this.cropper.zoom(-0.05)
      },

      zoom: function (event) {
        // Keep the image in its natural size
        if (event.detail.oldRatio === 1) {
          event.preventDefault();
        }
      }
    })
  }

  
  static styles = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        left: 0;
        right: 0;
        bottom: 0;
        top: 0;
        position: absolute;
        overflow: hidden;
        z-index: 10002;
        opacity: 0;
        pointer-events: none;
        align-items: center;
        justify-content: center;
        width: calc(100% - 16px);
      }

      ::slotted(*) {
        pointer-events: none;
      }

      :host([open]), :host([open]) ::slotted(*) {
        pointer-events: auto;
        opacity: 1;
      }

      .scrim {
        background-color: var(--md-sys-color-scrim);
        position: absolute;
        inset: 0;
        background-color: var(--md-sys-color-scrim);
        opacity: 0.44;
        pointer-events: none;
      }

      flex-container {
        overflow: hidden;
        border-top-left-radius: var(--md-sys-shape-corner-extra-large);
        border-top-right-radius: var(--md-sys-shape-corner-extra-large);
        max-height: 80%;
      }

      img {
        display: block;
      
        /* This rule is very important, please don't ignore this */
        max-width: 100%;
      }

      flex-row {
        max-width: 640px;
        border-bottom-left-radius: var(--md-sys-shape-corner-extra-large);
        border-bottom-right-radius: var(--md-sys-shape-corner-extra-large);
        width: 100%;
        background-color: var(--md-sys-color-surface-variant);
        padding: 12px 12px;
      }
    `
  ];

  render() {
    return html`
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.css">
    <span class="scrim"></span>
    <flex-container padding="0">
      <img id="cropper">

      
    </flex-container>
    <flex-row class="actions">
        <custom-button label="cancel" type="elevated" action="close">
          <custom-icon slot="icon">close</custom-icon>
        </custom-button>
        <flex-it></flex-it>
        <custom-button label="done" type="tonal" action="done">
          <custom-icon slot="icon">done</custom-icon>
        </custom-button>
      </flex-row>
    `;
  }
}
