import { CustomSelector } from '@vandeurenglenn/lite-elements/selector.js'
import { customElement, property, html, css } from '@vandeurenglenn/lite'

declare global {
  interface HTMLElementTagNameMap {
    'top-menu': TopMenu
  }
}

@customElement('top-menu')
export class TopMenu extends CustomSelector {
  @property({ type: String })
  accessor route: string

  @property({ type: String })
  accessor previousRoute: string

  select(route: string) {
    if (route !== this.route && route) {
      this.querySelector(`[route="${this.previousRoute}"]`) &&
        this.querySelector(`[route="${this.previousRoute}"]`).classList.remove('custom-selected')
      this.previousRoute = route
      this.route = route
      if (this.querySelector(`[route="${this.route}"]`))
        this.querySelector(`[route="${this.route}"]`).classList.add('custom-selected')
      const paths = route.split('/')
      paths.pop()

      if (paths) {
        for (const path of paths) {
          const el = this.querySelector(`sub-menu[headline="${path}"]`)
          if (el) el.open = true
        }
      }
    }
  }

  static styles = [
    ...super.styles,
    css`
      :host {
        padding: 0 16px;
        box-sizing: border-box;
        overflow-y: initial;
      }
    `
  ]

  render() {
    return html`<slot></slot>`
  }
}
