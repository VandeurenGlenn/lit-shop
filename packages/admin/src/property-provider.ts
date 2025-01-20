import { LiteElement } from '@vandeurenglenn/lite'

export class PropertyProvider extends LiteElement {
  #propertyProviders = []

  propertyProviders = {}

  setupPropertyProvider(propertyProvider, type = 'array', events?) {
    return new Promise(async (resolve, reject) => {
      this.#propertyProviders.push(propertyProvider)

      if (!this[propertyProvider]) this[propertyProvider] = type === 'object' ? {} : []

      const deleteOrReplace = async (propertyProvider, snap, task = 'replace') => {
        const val = await snap.val()
        if (type === 'array') {
          if (typeof val === 'object' && !Array.isArray(val)) val.key = snap.key
          let i = -1

          for (const item of this[propertyProvider]) {
            i += 1
            if (item.key === snap.key) break
          }

          if (task === 'replace') this[propertyProvider].splice(i, 1, val)
          else this[propertyProvider].splice(i, 1)
          this[propertyProvider] = [...this[propertyProvider]]
        } else if (type === 'object') {
          if (task === 'replace') this[propertyProvider][snap.key] = val
          else delete this[propertyProvider][snap.key]
          this[propertyProvider] = { ...this[propertyProvider] }
        }

        if (task === 'replace') events?.onChildChanged?.(val)
        else events?.onChildRemoved?.(val)
      }

      firebase.onChildAdded(propertyProvider, async (snap) => {
        const val = await snap.val()

        if (type === 'array') {
          if (typeof val === 'object' && !Array.isArray(val)) val.key = snap.key
          if (!this[propertyProvider]) {
            this[propertyProvider] = [val]
          } else if (!this[propertyProvider].includes(val)) {
            this[propertyProvider].push(val)
          }
          this[propertyProvider] = [...this[propertyProvider]]
        } else if (type === 'object') {
          if (!this[propertyProvider]) this[propertyProvider] = {}
          this[propertyProvider][snap.key] = val
          this[propertyProvider] = { ...this[propertyProvider] }
        }
        events?.onChildAdded?.(val)
        resolve(this[propertyProvider])
      })

      setTimeout(async () => {
        resolve(true)
      }, 1000)

      firebase.onChildChanged(propertyProvider, (snap) => deleteOrReplace(propertyProvider, snap, 'replace'))
      firebase.onChildRemoved(propertyProvider, (snap) => deleteOrReplace(propertyProvider, snap, 'delete'))
    })
  }

  handlePropertyProvider(propertyProvider) {
    if (this.propertyProviders[propertyProvider]) {
      const promises = []
      for (const input of this.propertyProviders[propertyProvider]) {
        let propertyKey
        if (typeof input === 'object') propertyKey = input.name
        else propertyKey = input

        if (!this.#propertyProviders.includes(propertyKey))
          promises.push(this.setupPropertyProvider(propertyKey, input?.type, input?.events))
      }
      return Promise.all(promises)
    }
  }
}
