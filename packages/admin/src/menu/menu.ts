import { CustomSelector } from '@vandeurenglenn/lit-elements/selector.js';
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js'

declare global {
  interface HTMLElementTagNameMap {
    'top-menu': TopMenu
  }
}

@customElement('top-menu')
export class TopMenu extends CustomSelector {
  @property({type: String})
  route: string

  @property({type: String})
  previousRoute: string

  select(route: string) {
    if (route !== this.route && route) {
      
      this.querySelector(`[route="${this.previousRoute}"]`) && this.querySelector(`[route="${this.previousRoute}"]`).classList.remove('custom-selected')
      this.previousRoute = route
      this.route = route
      if (this.querySelector(`[route="${this.route}"]`)) this.querySelector(`[route="${this.route}"]`).classList.add('custom-selected')
      const paths = route.split('/')
      paths.pop()
      
      if (paths) {
        for (const path of paths) {
          this.querySelector(`sub-menu[headline="${path}"]`).open = true
        }
      }
    }
  }

  static styles = [
    css`
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
      ::slotted(*) {
        pointer-events: auto;
      }
    `
  ];

  render() {
    return html`<slot></slot>`;
  }
}
