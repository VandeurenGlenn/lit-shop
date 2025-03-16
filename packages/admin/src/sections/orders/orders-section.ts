import { LiteElement, property, html, customElement, css, query } from '@vandeurenglenn/lite'
import '@vandeurenglenn/flex-elements/container.js'
import '@vandeurenglenn/lite-elements/pages.js'
import '@vandeurenglenn/lite-elements/button.js'
import '@vandeurenglenn/lite-elements/icon.js'
import './order-section.js'

@customElement('orders-section')
export class OrdersSection extends LiteElement {
  @property({ type: Array, consumes: 'orders' }) accessor orders

  @property({ type: String }) accessor currentFilter = ['PAID']

  @property({ type: String }) accessor selection

  @query('custom-pages') accessor pages

  static styles = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        align-items: center;
      }

      a {
        display: flex;
        align-items: center;
        text-decoration: none;
        pointer-events: auto !important;
        background: var(--md-sys-color-surface-variant);
        padding: 12px 24px;
        width: 100%;
        box-sizing: border-box;
        justify-content: space-between;
        border-radius: var(--md-sys-shape-corner-large);

        color: var(--md-sys-color-on-surface-variant);
        margin-top: 8px;
      }
      [active] {
        background: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
      }
      flex-row:not(.body) {
        width: 100%;
        max-width: 620px;
        align-items: center;
        gap: 8px;
      }
      flex-row.body custom-icon {
        margin-left: 8px;
      }

      section {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
    `
  ]

  onChange(propertyKey: string, value: any): void {
    console.log('changed', propertyKey, value)
  }

  filter(event, filter) {
    if (this.currentFilter.includes(filter)) {
      this.currentFilter.splice(this.currentFilter.indexOf(filter), 1)
    } else {
      this.currentFilter.push(filter)
    }

    this.requestRender()
  }

  select(event, order) {
    console.log(event)

    console.log('select', order)

    if (!order) {
      this.pages.select('orders')
      return
    }

    console.log('select', order)
    this.selection = order
    this.pages.select('order')
    this.requestRender()
  }

  render() {
    return html` <custom-pages attr-for-selected="route">
      <section route="orders">
        <flex-row class="filter">
          <custom-button
            label="paid"
            type="outlined"
            ?active=${this.currentFilter?.includes('PAID')}
            @click=${(event) => this.filter(event, 'PAID')}>
            <custom-icon
              icon="paid"
              slot="icon"></custom-icon
          ></custom-button>
          <custom-button
            label="shipped"
            type="outlined"
            ?active=${this.currentFilter?.includes('SHIPPED')}
            @click=${(event) => this.filter(event, 'SHIPPED')}>
            <custom-icon
              icon="shipped"
              slot="icon"></custom-icon
          ></custom-button>

          <custom-button
            label="pending"
            type="outlined"
            ?active=${this.currentFilter?.includes('PENDING')}
            @click=${(event) => this.filter(event, 'PENDING')}>
            <custom-icon
              icon="pending"
              slot="icon"></custom-icon>
          </custom-button>
        </flex-row>
        <flex-container>
          ${this.orders
            ?.filter((order) => (this.currentFilter?.length > 0 ? this.currentFilter.includes(order.status) : true))
            .map(
              (order) => html`
                <a href="/#!/orders/order?selected=${order.key}">
                  <span>${order.key}</span>
                  <flex-row
                    class="body"
                    center>
                    <strong>${Object.keys(order.items).length}</strong>${order.status === 'PAID'
                      ? html`<custom-icon icon="paid"></custom-icon>`
                      : order.status === 'SHIPPED'
                      ? html`<custom-icon icon="shipped"></custom-icon>`
                      : html`<custom-icon icon="pending"></custom-icon>`}</flex-row
                  >
                </a>
              `
            )}
        </flex-container>
      </section>

      <order-section
        route="order"
        .order=${this.orders?.find((order) => order.key === this.selection)}></order-section>
    </custom-pages>`
  }
}
