import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PhotoSelfieComponent extends Component {
  @tracked showCamera = true;
  @tracked cameraReady = false;

  origCanvas = null;

  /*
   * Setup the camera when the video element has been inserted into the DOM.
   */

  @action
  setupCamera(player) {
    // Attach the video stream to the video element and autoplay.
    const container = document.querySelector('#camera-container');

    this.cameraReady = false;
    player.addEventListener('loadeddata', () => {
      // HAVE_CURRENT_DATA (2) or greater indicates the camera has initialized
      // and is streaming
      if (player.readyState >= 2 && !this.cameraReady) {
        this.cameraReady = true;
      }
    });

    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: { ideal: 'user' },
        width: { max: container.clientWidth }
      }
    }).then((stream) => {
      // Attach the stream to the video element
      player.srcObject = stream;
    }).catch(() => {
      this.toast.error('Sorry, the camera could not be used.');
    });
  }

  /*
   * Stop the camera when the video element is removed.
   */

  @action
  destroyCamera(player) {
    if (player.srcObject) {
      player.srcObject.getVideoTracks().forEach(track => track.stop());
    }

    if (this.origCanvas) {
      this.origCanvas.remove();
      this.origCanvas = null;
    }
  }

  /*
   * Take an image and pass it back to the calling component
   */

  @action
  snapShutterAction() {
    const player = document.getElementById('photo-player');
    // Grab the original image

    const origCanvas = document.createElement('canvas');
    const origContext = origCanvas.getContext('2d');

    this.origCanvas = origCanvas;

    origCanvas.setAttribute('width', player.videoWidth);
    origCanvas.setAttribute('height', player.videoHeight);

    // Retain the mirror image
    origContext.translate(player.videoWidth, 0);
    origContext.scale(-1, 1);

    // Copy the image off
    origContext.drawImage(player, 0, 0, player.videoWidth, player.videoHeight);

    // Stop the video player
    player.srcObject.getVideoTracks().forEach(track => track.stop());

    // Convert the data to a jpeg at 90% quality
    origCanvas.toBlob((blob) => {
      origCanvas.remove();
      this.args.useSelfieAction(blob);
    }, 'image/jpg', 0.9);
  }

  /*
   Code to center crop the image and scale.

    const canvas = document.createElement('canvas');
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);

    const context = canvas.getContext('2d');
    context.translate(width, 0);
    context.scale(-1, 1);

    context.drawImage(player,
      Math.floor((player.videoWidth / 2) - (width / 2)),
      Math.floor((player.videoHeight / 2) - (height / 2)),
      width,
      height,
      0,
      0,
      width,
      height
    );

    // Stop all video streams.
    player.srcObject.getVideoTracks().forEach(track => track.stop());

    // Convert the data
    canvas.toBlob((blob) => {
      this.imageDataBlob = blob;
      this.previewImageDataUrl = URL.createObjectURL(blob);
      canvas.remove();
    }, 'image/jpg', 0.9);
    */
}
