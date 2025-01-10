import Component from '@glimmer/component';
import {action} from '@ember/object';
import {service} from '@ember/service';
import {tracked} from '@glimmer/tracking';

export default class PhotoUploadComponent extends Component {
  @service ajax;
  @service session;
  @service house;
  @service toast;

  @tracked showUploadDialog = false;

  @tracked step = 'showGuidelines';
  @tracked isSubmitting = false;
  @tracked hasCamera = false;

  @tracked originalImage = null;
  @tracked originalImageDataUrl = null;

  @tracked showNoBlobError = false;

  @tracked isLoading;

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

    if (this.args.isPersonManage) {
      // Skip showing guidelines
      this.step = 'source';
    }
  }

  @action
  gotoSourceStep() {
    this.step = 'source';
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

  async _uploadImage(origBlob, origFilename, imageBlob = null, imageFilename = null) {
    this.showNoBlobError = false;

    const formData = new FormData();
    formData.append('orig_image', origBlob, origFilename);

    if (imageBlob) {
      // Uploading a cropped image.. otherwise the backend will deal with it.
      formData.append('image', imageBlob, imageFilename);
    }

    this.isSubmitting = true;

    try {
      await this.ajax.request(`person/${this.args.person.id}/photo`, {
        method: 'POST',
        data: formData,
        processData: false,
        contentType: false,
      });
      this.toast.success('Photo successfully uploaded.');
      this.args.refreshPhoto();
      this.args.closeAction();
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  async fileChangeEvent(event) {
    const element = event.target;
    if (!element.value) {
      return;
    }

    const file = element.files[0];
    this.originalFilename = element.value;

    try {
      this.isSubmitting = true;
      const formData = new FormData();
      formData.append('image', file, this.originalFilename);

      const {image} = await this.ajax.request('person-photo/convert', {
        method: 'POST',
        data: formData,
        processData: false,
        contentType: false,
      });
      this.originalImage = file;
      this.originalImageDataUrl = URL.createObjectURL(this._base64ToBlob(image, 'image/jpeg'));
      this.step = 'edit-photo';
    } catch (response) {
      element.value = null;
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
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

  /**
   * Pulled from https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
   * @param b64Data
   * @param contentType
   * @returns {Blob}
   * @private
   */

  _base64ToBlob(b64Data, contentType) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
    const sliceSize = 1024;

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, {type: contentType});
    return blob;
  }
}
