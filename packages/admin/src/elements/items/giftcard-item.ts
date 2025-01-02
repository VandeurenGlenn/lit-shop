import { LiteElement, html, property } from '@vandeurenglenn/lite'

export class GiftcardItem extends LiteElement {
  @property({ type: Object }) accessor giftcard: any
  render() {
    return html` ${this.giftcard.uuid} ${this.giftcard.amount} `
  }
}
