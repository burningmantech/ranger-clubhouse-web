import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import loadImage from 'blueimp-load-image';

export default class PhotoUploadComponent extends Component {
  @service ajax;
  @service session;
  @service house;
  @service toast;

  @tracked showUploadDialog = false;

  @tracked step = 'source';
  @tracked isSubmitting = false;
  @tracked hasCamera = false;

  @tracked originalImage = null;
  @tracked originalImageDataUrl = null;

  cropper = null;

  width = 350;
  height = 450;

  maxWidth = 1050;
  maxHeight = 1350;

  constructor() {
    super(...arguments);

    /*
     * Don't offer to grab an image from <PhotoSelfie /> when:
     *
     * 1. The device is a mobile or tablet. The vendor's browser will offer a
     * camera with input[type=file] AND do a better job of taking a photo by providing
     * native controls and adjustments. (e.g., On iPhones, the screen will brighten
     * and turn entirely white to simulate a fill-flash after the user clicks the shutter button.)
     *
     * 2. A camera is not available, duh. NOTE: Safari will not offer a camera device when
     * the page is loaded under plain-only HTTP making development a royal PITA.
     */

    if (this.session.isMobileDevice ||
      this.session.isTabletDevice ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.enumerateDevices) {
      this.hasCamera = false;
    } else {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        if (devices.some(device => 'videoinput' === device.kind)) {
          if (!this.hasCamera) {
            //I can haz camera!
            this.hasCamera = true;
          }
        }
      });
    }
  }
  @action
  useSelfieAction(origBlob) {
    this.originalImage = origBlob;
    this.originalImageDataUrl = URL.createObjectURL(origBlob);
    this.step = 'edit-photo';
  }

  @action
  uploadEditAction(blob) {
    this._uploadImage(this.originalImage, 'self.jpg', blob, 'crop.jpg');
  }

  @action
  usePhotoAction() {
    this._uploadImage(this.originalImage, this.originalFilename);
  }

  _uploadImage(origBlob, origFilename, imageBlob = null, imageFilename = null) {
    const formData = new FormData();

    formData.append('orig_image', origBlob, origFilename);

    if (imageBlob) {
      // Uploading a cropped image.. otherwise the backend will deal with it.
      formData.append('image', imageBlob, imageFilename);
    }

    this.isSubmitting = true;

    // Let the backend know the user might be uploading a new photo.
    this.ajax.post(`person/${this.args.person.id}/photo`, {
      data: formData,
      processData: false,
      contentType: false,
    }).then(() => {
      this.toast.success('Photo successfully uploaded.');
      this.args.refreshPhoto();
      this.args.closeAction();
    }).catch((response) => {
      this.house.handleErrorResponse(response);
    }).finally(() => {
      this.isSubmitting = false;
    })

  }

  @action
  fileChangeEvent(event) {
    const element = event.target;
    if (element.value == '') {
      return;
    }

    const file = element.files[0];
    this.originalFilename = element.value;

    this._scaleImage(file, this.maxWidth, this.maxHeight, (origBlob) => {
      this.originalImage = origBlob;
      this.originalImageDataUrl = URL.createObjectURL(origBlob);
      this.step = 'edit-photo';
    });
  }

  @action
  takeSelfieAction() {
    this.step = 'take-selfie';
  }

  @action
  showUploadDialogAction() {
    this.step = 'source';
    this.showUploadDialog = true;
  }


  @action
  chooseSourceAction() {
    this.step = 'source';
  }

  _scaleImage(image, maxWidth, maxHeight, callback, dataUrl = false) {
    const options = {
      //should be set to canvas : true to activate auto fix orientation
      canvas: true,
      orientation: true,
      maxWidth,
      maxHeight,
      downsamplingRatio: maxWidth / maxHeight
    };

    // eslint-disable-next-line no-undef
    loadImage(image, function (canvas) {
      if (dataUrl) {
        const data = canvas.toDataURL('image/jpeg', 0.9);
        canvas.remove();
        callback(data);
      } else {
        canvas.toBlob((blob) => {
          canvas.remove();
          callback(blob);
        }, 'image/jpeg', 0.9);
      }
    }, options);
  }

}
