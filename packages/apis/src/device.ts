export declare type VideoFacingModes = {
  user: boolean
  environment: boolean
  front: boolean
  back: boolean
}

export class DeviceApi {
  #cameraStream
  #imageCapture

  async facingModes(): Promise<VideoFacingModes> {
    const user = await this.hasFrontCam()
    const environment = await this.hasFrontCam()
    return {
      user,
      environment,
      front: user,
      back: environment
    }
  }

  async hasFrontCam() {
    try {
      await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      })
      return true
    } catch (e) {
      return false
    }
  }

  async hasBackCam() {
    try {
      await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      return true
    } catch (e) {
      return false
    }
  }

  /**
   * @param {string} facingMode ['environment'|'user'] -
   * the desired camera to use
   */
  async _createCameraStream(facingMode = 'environment') {
    if (!this.#cameraStream) {
      const gotMedia = (mediaStream) => {
        this.#cameraStream = mediaStream
        const mediaStreamTrack = mediaStream.getVideoTracks()[0]
        this.#imageCapture = new globalThis.ImageCapture(mediaStreamTrack)
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode }
      })
      return gotMedia(stream)
    }
  }
  /**
   * @param {HTMLElement} el
   * @param {string} facingMode ['environment'|'user'] -
   * the desired camera to use
   */
  async _previewCamera(el, facingMode) {
    if (el.srcObject) el.srcObject = null
    if (!el) throw Error('No target HTMLElement defined')
    if (!this.#cameraStream) await this._createCameraStream(facingMode)
    el.srcObject = this.#cameraStream
  }

  _close() {
    if (!this.#cameraStream) return
    const tracks = this.#cameraStream.getTracks()

    for (const track of tracks) {
      track.stop()
      this.#cameraStream.removeTrack(track)
    }

    this.#cameraStream = undefined
    this.#imageCapture = undefined
  }

  /**
   * @return {object} { preview(), takePhoto(facingMode) } - camera methods
   *
   */
  get camera() {
    return {
      preview: (el, facingMode) => this._previewCamera(el, facingMode),
      takePhoto: async (facingMode) => {
        if (!this.#cameraStream) await this._createCameraStream(facingMode)
        return this.#imageCapture.takePhoto()
      },
      close: this._close.bind(this)
    }
  }
}
