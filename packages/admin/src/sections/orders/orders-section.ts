import { LiteElement, property, html, customElement } from '@vandeurenglenn/lite'

customElement('orders-section')
export class OrdersSection extends LiteElement {
  @property({ type: Array, consumes: 'orders' }) accessor orders

  render() {
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
