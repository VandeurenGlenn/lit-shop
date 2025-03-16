import { LiteElement, property, html, customElement, css } from '@vandeurenglenn/lite'
import '@vandeurenglenn/flex-elements/container.js'
import { Order } from '../../../../types/orders.js'
import '@vandeurenglenn/lite-elements/toggle-button.js'
import '@vandeurenglenn/lite-elements/elevation.js'

@customElement('order-section')
export class OrderSection extends LiteElement {
  @property({ type: Object }) accessor order: Order

  onChange(propertyKey: string, value: any): void {
    console.log('changed', propertyKey, value)
  }
  static styles = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        align-items: center;
      }
      .list flex-row {
        justify-content: space-between;
        gap: 8px;
      }

      .list {
        padding: 12px 24px;
        border-radius: var(--md-sys-shape-corner-medium);
        box-sizing: border-box;
        margin-bottom: 8px;
        position: relative;
      }

      flex-row {
        width: 100%;
      }
      .header {
        width: 100%;
        justify-content: space-between;
        padding: 12px 24px;
        background: var(--md-sys-color-surface-variant);
        border-radius: var(--md-sys-shape-corner-medium);
        box-sizing: border-box;
        margin-bottom: 24px;
      }

      flex-container {
        width: 100%;
        max-width: 620px;
        border-radius: var(--md-sys-shape-corner-medium);
        padding: 0;
      }

      custom-elevation {
        border-radius: var(--md-sys-shape-corner-medium);
      }

      .text-overflow {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
    `
  ]

  filter(event, filter) {
    if (this.currentFilter.includes(filter)) {
      this.currentFilter.splice(this.currentFilter.indexOf(filter), 1)
    } else {
      this.currentFilter.push(filter)
    }

    this.requestRender()
  }

  render() {
    if (!this.order) return html`<p>Loading...</p>`

    return html` <flex-container>
      <flex-row
        center
        class="header">
        <p>${this.order.key}</p>

        <p>${this.order.status}</p>
      </flex-row>

      <flex-column class="list">
        <custom-elevation level="1"></custom-elevation>
        ${Object.values(this.order?.items)?.map(
          (item) => html` <flex-row center>
            <p>
              <flex-row>${item.amount} <span>x</span></flex-row>
              <p class="text-overflow">${item.name}</p>
            </p>
            <p>${item.EAN}</p>
            <custom-toggle-button togglers='["check_box_outline_blank", "check_box"]'></custom-toggle-button>
          </flex-row>`
        )}
      </flex-column>
      <custom-icon-button
        type="text"
        icon="chevron_right"></custom-icon-button>
    </flex-container>`
  }
}
