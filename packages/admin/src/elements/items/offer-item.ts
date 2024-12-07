import {
  customElement,
  property,
  html,
  css,
  LiteElement,
} from '@vandeurenglenn/lite';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/filled-icon-button.js';

@customElement('offer-item')
export class OfferItem extends LiteElement {
  @property({ type: Boolean, reflect: true })
  accessor draggable: boolean = true;

  @property({ type: String, reflect: true })
  accessor key: string;

  @property({ type: String })
  accessor name: string;

  @property({ type: String, reflect: true })
  accessor public: string;

  async connectedCallback() {
    this.ondragstart = this.#ondragstart.bind(this);
  }

  #ondragstart(event) {
    event.dataTransfer.setData('text', this.key);
  }

  private _publicClicked(event) {
    console.log('click');
    event.stopImmediatePropagation();
    event.stopPropagation();
    const bool = this.public === 'true';
    this.public = String(!bool);
    console.log(this.public);
    console.log(this.key);

    firebase.database().ref(`offers/${this.key}/public`).set(this.public);
  }

  static styles = [
    css`
      :host {
        display: block;
        pointer-events: auto;
        background: var(--md-sys-color-surface-variant);
        padding: 12px 24px;
        box-sizing: border-box;
        border-radius: var(--md-sys-shape-corner-large);
      }

      custom-icon[public] {
        --custom-icon-color: #4caf50;
      }

      a {
        display: flex;
        align-items: center;
        text-decoration: none;

        color: var(--md-sys-color-on-surface-variant);
      }

      .body {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: inline-block;
        width: 100%;
        min-width: 0;
      }
    `,
  ];

  render() {
    return html`
      <a href="#!/catalog/offer?selected=${this.key}">
        <span class="body">${this.name}</span>
        <custom-icon
          slot="end"
          ?public=${this.public === 'true'}
          @click=${this._publicClicked}
          icon="public"
        ></custom-icon>
      </a>
    `;
  }
}
