import '../../elements/input-fields/input-fields.js'

export default customElements.define('settings-section', class SettingsSection extends HTMLElement {
  
  get settings() {
    return window.topstore.databases.get('settings');
  }
  
  constructor() {
    super();
    this.attachShadow({mode: 'open'})
    this.shadowRoot.innerHTML = this.template
  }
  
  connectedCallback() {
    (async () => {
      const settings = await this.settings.get()
      
      for (const key of Object.keys(settings)) {
        for (var _key of Object.keys(settings[key])) {
          for (var __key of Object.keys(settings[key][_key])) {
          if (key === 'hours') {
            const items = Array.from(this.shadowRoot.querySelectorAll(`[key=${_key}]`))
            for (const item of items) {              
              if (item.name === `${__key}/from`) item.value = settings[key][_key][__key].from
              if (item.name === `${__key}/to`) item.value = settings[key][_key][__key].to
            }
          }
        }
      }
      }
    })();
    
    
    pubsub.subscribe('settings.hours', ({key, name, value}) => {
      firebase.database().ref(`settings/hours/${key}/${name}`).set(value)
    })
  }
  get template() {
    return `<style>
      :host {
        display: flex;
        flex-direction: column;
      }
      
      .row {
        display: flex;
      }
    </style>
    
    <h3><translated-string>collection times</translated-string></h3>    
    <span class="row">
      <input-field key="pickup" name="tuesday/from" event="settings.hours"></input-field>
      <input-field key="pickup" name="tuesday/to" event="settings.hours"></input-field>
    </span>
    <span class="row">
    <input-field key="pickup" name="friday/from" event="settings.hours"></input-field>
    <input-field key="pickup" name="friday/to" event="settings.hours"></input-field>
    </span>
    
    <h3><translated-string>selfservice</translated-string></h3>
    <span class="row">
    <input-field key="selfservice" name="tuesday/from" event="settings.hours"></input-field>
    <input-field key="selfservice" name="tuesday/to" event="settings.hours"></input-field>
    </span>
    <span class="row">
    <input-field key="selfservice" name="friday/from" event="settings.hours"></input-field>
    <input-field key="selfservice" name="friday/to" event="settings.hours"></input-field>
    </span>
    `
  }
});