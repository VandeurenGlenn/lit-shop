import Imgur from './imgur/imgur.js'
import { imgurAlbumParams, imgurImageParams } from './imgur/types.js'

const clientId = await firebase.get('apiKeys/imgur')

export declare type firebaseImgurAlbum = {
  id: string
  firebaseKey: string
  deletehash: string
}
export declare type firebaseImgurImage = {
  id: string
  firebaseKey: string
  deletehash: string
}

export declare type imgurBaseAlbum = {
  firebaseKey: string
  id: string
  deletehash: string
  account_id?: string
  account_url?: string
  ad_config?: {}
  cover?: string
  cover_edited: string
  cover_height: string
  cover_width: string
  datetime: EpochTimeStamp
  description: string
  favorite: boolean
  images: string[]
  length: number
  images_count: number
  in_gallery: boolean
  include_album_ads: boolean
  is_ad: boolean
  is_album: boolean
  layout: string | 'blog' //     todo checkout layout
  link: string
  nsfw: boolean
  privacy: 'hidden' | 'public'
  section: string
  title: string
  views: number
}

export declare type imgurBaseImage = {
  firebaseKey: string
  id: string
  title: string | null
  description: string | null
  datetime: EpochTimeStamp
  type: string | 'image/gif'
  animated: boolean
  width: number
  height: number
  size: number
  views: number
  bandwidth: number
  vote: null | string
  favorite: boolean
  nsfw: null | string
  section: null | string
  account_url: null
  account_id: 0
  is_ad: false
  in_most_viral: false
  tags: []
  ad_type: 0
  ad_url: string
  in_gallery: false
  deletehash: string
  name: string
  link: string
}

export default class ImgurBase extends Imgur {
  // todo support authenticated and anonymous (if authenticated ids are used, else delethashes are used)
  constructor() {
    super({
      clientId
    })
  }

  async createAlbum({ ids, title, description, cover }: imgurAlbumParams): Promise<firebaseImgurAlbum> {
    const result = await super.createAlbum({ ids, title, description, cover })
    const firebaseKey = await firebase.push('albums', result)

    return { ...result, firebaseKey }
  }

  async getAlbums(): Promise<imgurBaseAlbum[]> {
    const albums = await firebase.get('albums')

    if (!albums) return []
    return Promise.all(
      Object.entries(albums).map(async ([firebaseKey, album]: [string, firebaseImgurAlbum]) => {
        const result = await super.getAlbum(album.id)
        return { firebaseKey, ...album, ...result }
      })
    )
  }

  async removeAlbum({ deletehash, firebaseKey }: imgurBaseAlbum) {
    try {
      await super.removeAlbum(deletehash)
      await firebase.remove(`albums/${firebaseKey}`)
      return 'success'
    } catch (error) {
      console.log(error)
    }
    // .remove()
  }

  async getAlbum(firebaseKey: string): Promise<imgurBaseAlbum> {
    const album = await firebase.get(`albums/${firebaseKey}`)

    return {
      firebaseKey,
      deletehash: album.deletehash,
      ...(await super.getAlbum(album.id)),
      images: await super.getAlbumImages(album.id)
    }
  }

  async getAlbumImages(firebaseKey: string): Promise<imgurBaseImage[]> {
    const album = await firebase.get(`albums/${firebaseKey}`)
    return { firebaseKey, ...super.getAlbumImages(album.id), ...album }
  }

  async addImage(image: imgurImageParams): Promise<imgurBaseImage> {
    const result = await super.addImage(image)
    const firebaseKey = await firebase.push('images', {
      id: result.id,
      deletehash: result.deletehash,
      link: result.link
    })
    return { ...result, firebaseKey }
  }

  async getImage(firebaseKey: string): Promise<imgurBaseImage> {
    const image = await firebase.get(`images/${firebaseKey}`)
    return { firebaseKey, ...(await super.getImage(image.id)), ...image }
  }

  async getImages(): Promise<imgurBaseImage[]> {
    const images = await firebase.get('images')
    if (!images) return []
    return Promise.all(
      Object.entries(images).map(async ([firebaseKey, image]: [string, imgurBaseImage]) => ({
        firebaseKey,
        ...(await super.getImage(image.id)),
        ...image
      }))
    )
  }

  async removeImage({ deletehash, firebaseKey }: imgurBaseImage) {
    try {
      await firebase.remove(`images/${firebaseKey}`)
      await super.removeImage(deletehash)
      return 'success'
    } catch (error) {
      console.log(error)
    }
  }

  async lookup(id) {
    const images = await firebase.get('images')
    return Object.entries(images).filter((entry) => entry[1].id === id)
  }
}
