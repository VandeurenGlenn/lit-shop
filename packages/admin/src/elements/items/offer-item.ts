import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js'
import '@material/web/list/list-item.js'
import '@material/web/icon/icon.js'
import '@material/web/iconbutton/filled-icon-button.js'
import '@vandeurenglenn/lit-elements/icon-font.js'

@customElement('offer-item')
export class OfferItem extends LitElement {

  @property({ type: String, reflect: true })
  draggable: boolean = true;

  @property({ type: String, reflect: true })
  key: string;

  @property({ type: String, reflect: true })
  name: string;

  @property({ type: String, reflect: true })
  public: string;

  async connectedCallback() {
    super.connectedCallback()
    this.ondragstart = this.#ondragstart.bind(this)
    await this.updateComplete
  }

  #ondragstart(event) {
    event.dataTransfer.setData("text", this.key);
  }

  #publicClicked(event) {
    console.log('click');
    event.stopImmediatePropagation()
    event.stopPropagation()
    const bool = this.public === 'true'
    this.public = String(!bool)
    console.log(this.public);
    console.log(this.key);
    
    firebase.database().ref(`offers/${this.key}/public`).set(this.public)
  }

  static styles = [
    css`
      :host {
        display: block;
        pointer-events: auto;
      }

      custom-icon-font[public] {
        --custom-icon-color: #4caf50;
      }

      custom-icon-font {
        pointer-events: auto;
        text-decoration: none;
      }

      md-list-item-link {
        --md-list-item-link-icon-color: #4caf50;
        text-decoration: none;
      }

      a {
        display: flex;
        align-items: center;
        text-decoration: none;
        color: initial;
        padding: 8px 24px 8px 16px;
        box-sizing: border-box;
      }

      .body {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: inline-block;
        width: 100%;
        min-width: 0;
      }
    `
  ];

  render() {
    return html`
    <a href="#!/catalog/offer?selected=${this.key}">  
      <span class="body">${this.name}</span>
      <custom-icon slot="end" ?public=${this.public === 'true'} @click=${this.#publicClicked}>public</custom-icon>
    </a>
    `;
  }
}
