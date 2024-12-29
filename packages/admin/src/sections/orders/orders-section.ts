import { LiteElement, property, html, customElement, css } from '@vandeurenglenn/lite'

@customElement('orders-section')
export class OrdersSection extends LiteElement {
  @property({ type: Array, consumes: 'orders' }) accessor orders

  static styles = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        justify-content: center;
        align-items: center;
      }
    `
  ]

  render() {
    if (this.orders?.length === 0) return html`<p>No orders today</p>`
    if (!this.orders) return html`<p>Loading...</p>`
    return html`
      <ul>
        ${this.orders.map(
          (order) => html`
            <li>
              <p>Order ID: ${order.id}</p>
              <p>Customer: ${order.customer}</p>
              <p>Items: ${order.items}</p>
              <p>Total: ${order.total}</p>
            </li>
          `
        )}
      </ul>
    `
  }
}
