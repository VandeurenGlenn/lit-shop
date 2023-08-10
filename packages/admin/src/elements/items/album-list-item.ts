import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js'

declare global {
  interface HTMLElementTagNameMap {
    'album-grid-item': AlbumGridItem
  }
}

@customElement('album-grid-item')
export class AlbumGridItem extends LitElement {
  @property({ type: Object })
  set album(value) {
    this._album = value
    this.requestUpdate('album')
  }

  get album() {
    return this._album
  }
  static styles = [
    css`
      :host {
        display: flex;
        flex-direction: column;
      }
    `
  ];

  render() {
    return html`
    <img src=${this.album.cover}>
    <h5>${this.album.title}</h5>
    `;
  }
}
