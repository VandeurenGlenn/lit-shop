import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js'
import './media-images.js'
import './media-videos.js'

@customElement('media-section')
export class MediaSection extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
    `
  ];

  select(route) {
    this.renderRoot.querySelector('custom-pages').select(route)
  }

  render() {
    return html`
    <custom-pages attr-for-selected="route">
      <media-images route="images"></media-images>
      <media-videos route="videos"></media-videos>
    </custom-pages>
    `;
  }
}
