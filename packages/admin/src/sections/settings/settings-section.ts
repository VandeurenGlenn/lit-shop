import { customElement, html, LiteElement, property } from '@vandeurenglenn/lite'
import '../../elements/input-fields/input-fields.js'
import { Settings } from '@lit-shop/types'

@customElement('settings-section')
export class SettingsSection extends LiteElement {
  @property({ type: Object, consumes: 'settings' }) accessor settings: Settings

  render() {
    return html``
  }
}
