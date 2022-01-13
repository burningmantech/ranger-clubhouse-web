import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Cropper from 'cropperjs';

export default class PhotoEditComponent extends Component {
  @service modal;
  @service session;

  cropper = null;

  ordinateX = 1;
  ordinateY = 1;

  constructor() {
    super(...arguments);

    // Only show the cropper controls if running on a large screen.
    this.showEditControls = !(this.session.isMobileDevice || this.session.isTabletDevice);
  }

  willDestroy() {
    super.willDestroy(...arguments);
    // Clean up CropperJS
    if (this.cropper) {
      this.cropper.destroy();
    }
  }

  /*
   * When brower says the image has been loaded, fire up CopperJS
   */

  @action
  imageLoadedEvent(event) {
    this.cropper = new Cropper(event.target, {
      dragMode: 'move',
      aspectRatio: this.args.width / this.args.height,
      autoCropArea: 1,
      restore: false,
      guides: false,
      center: false,
      highlight: false,
      cropBoxMovable: false,
      cropBoxResizable: false,
      toggleDragModeOnDblclick: false,
      viewMode: 3,
      modal: true,
    });
  }

  /*
   * Let the caller component know the user is done cropping.
   */

  @action
  submitAction() {
    const canvas = this.cropper.getCroppedCanvas({ width: this.args.width, height: this.args.height });
    canvas.toBlob((blob) => this.args.submitAction(blob), 'image/png');
  }

  /*
   * Zoom the image out
   */

  @action
  zoomOutAction() {
    this.cropper.zoom(-0.1);
  }

  /*
   * Zoom the image in
   */

  @action
  zoomInAction() {
    this.cropper.zoom(0.1);
  }

  /*
   * Rotate by 10 degrees right
   */

  @action
  rotateRight() {
    this.cropper.rotate(10);
  }

  /*
   * Rotate by 10 degrees left
   */

  @action
  rotateLeft() {
    this.cropper.rotate(-10);
  }

  /*
   * Flip the image horizontally.
   */

  @action
  fipHorizontalAction() {
    this.ordinateX = -this.ordinateX;
    this.cropper.scaleX(this.ordinateX);
  }

  /*
   * Flip the image vertically.
   */

  @action
  fipVerticalAction() {
    this.ordinateY = -this.ordinateY;
    this.cropper.scaleY(this.ordinateY);
  }

}
