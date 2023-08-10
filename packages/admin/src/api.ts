import ImgurBase, { imgurBaseImage } from '@lit-shop/apis/imgur-base'
import { imgurAlbumParams, imgurImageParams, imgurCreateAlbumResponse } from '@lit-shop/apis/imgur/types'

export declare type removeParams = {
  deletehash: string,
  firebaseKey: string
}

class Api {
  imgurBase: ImgurBase
  constructor() {
    this.imgurBase = new ImgurBase()
  }

  async createAlbum({ ids, title, description, cover }: imgurAlbumParams): Promise<imgurCreateAlbumResponse> {
    return this.imgurBase.createAlbum({ ids, title, description, cover })
  }

  getAlbums() {
    return this.imgurBase.getAlbums()
  }

  getAlbum(id) {
    return this.imgurBase.getAlbum(id)
  }

  getAlbumImages(id) {
    return this.imgurBase.getAlbumImages(id)
  }

  removeAlbum(removeParams: removeParams) {
    return this.imgurBase.removeAlbum(removeParams)
  }

  addImage(image: imgurImageParams): Promise<imgurBaseImage> {
    return this.imgurBase.addImage(image)
  }

  getImages() {
    return this.imgurBase.getImages()
  }

  getImage(id) {
    return this.imgurBase.getImage(id)
  }

  removeImage(id) {
    return this.imgurBase.removeImage(id)
  }

  lookup(deletehash) {
    return this.imgurBase.lookup(deletehash)
  }
}

declare global {
  var api: Api
}

export default Api