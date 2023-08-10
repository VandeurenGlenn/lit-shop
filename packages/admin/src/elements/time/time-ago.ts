import { html, LitElement } from "lit";
import JSTimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import {interval} from './lib/time.js'

JSTimeAgo.addDefaultLocale(en)

export default customElements.define('time-ago', class TimeAgo extends LitElement {
  static properties = {
    value: {
      type: Number
    }
  }
  constructor() {
    super()    
    this.timeAgo = new JSTimeAgo('en-US')
    pubsub.subscribe('interval:1000', () => {
      this.innerHTML = this.timeAgo.format(this.value)
    })
    interval()
    
  }

  render() {
    return html`
    <style>


    </style>
    <slot>${this.timeAgo.format(this.value)}</slot>
    
    `
  }
  
})