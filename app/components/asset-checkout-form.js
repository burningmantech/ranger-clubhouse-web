import Component from '@glimmer/component';
import EmberObject from '@ember/object';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {validatePresence} from 'ember-changeset-validations/validators';
import {service} from '@ember/service';

export default class AssetCheckoutFormComponent extends Component {
  @service ajax;
  @service toast;
  @service house;

  assetValidations = {
    barcode: [validatePresence(true)]
  };

  @tracked assetForm = EmberObject.create({});

  @tracked barcodeNotFound = null;
  @tracked barcodeCheckedOut = null;
  @tracked isSubmitting = false;
  @tracked showHistory = false;

  constructor() {
    super(...arguments);

    const options = this.args.attachments.map((a) => [a.description, a.id]);
    options.unshift(['-', '']);
    this.attachmentOptions = options;
  }

  /**
   * Clear out the search errors.
   */

  clearErrors() {
    this.barcodeNotFound = false;
    this.barcodeCheckedOut = null;
  }

  /**
   * Check out an asset
   * @param model
   * @param isValid
   * @returns {Promise<void>}
   */

  @action
  async checkoutAsset(model, isValid) {
    if (!isValid) {
      return;
    }

    const barcode = model.barcode;
    this.clearErrors();

    this.isSubmitting = true;
    try {
      const result = await this.ajax.request('asset/checkout', {
        method: 'POST',
        data: {person_id: this.args.person.id, barcode, attachment_id: model.attachment_id}
      });

      switch (result.status) {
        case 'success':
          this.toast.success('Asset was successfully checked out.');
          this.assetForm = EmberObject.create({});
          await this.args.assets.update();
          this.args.onCheckOut?.(result.asset);
          break;

        case 'not-found':
          this.barcodeNotFound = barcode;
          break;

        case 'checked-out':
          this.barcodeCheckedOut = result;
          this.barcodeCheckedOut.barcode = barcode;
          break;
      }
    } catch (response) {
      this.house.handleErrorResponse(response)
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Show the asset history for a checked out asset.
   */

  @action
  showHistoryAction() {
    this.showHistory = true;
  }

  /**
   * Close up the asset history
   */

  @action
  closeHistory() {
    this.showHistory = false;
  }
}
