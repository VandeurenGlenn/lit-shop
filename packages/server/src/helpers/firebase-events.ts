export type FirebaseEventOptions = {
  value?: any
  getOnStart?: boolean
  added?: (key: string, value: any) => void
  changed?: (key: string, value: any) => void
  removed?: (key: string) => void
}

export default async (ref, options) => {
  let items = options.value || {}
  if (options.getOnStart)
    try {
      items = await ref.get()
    } catch {}

  ref.on('child_added', (snapshot) => {
    items[snapshot.key] = snapshot.val()
    options.added?.(snapshot.key, snapshot.val())
  })

  ref.on('child_changed', (snapshot) => {
    items[snapshot.key] = snapshot.val()
    options.changed?.(snapshot.key, snapshot.val())
  })

  ref.on('child_removed', (snapshot) => {
    delete items[snapshot.key]
    options.removed?.(snapshot.key)
  })

  return items
}
