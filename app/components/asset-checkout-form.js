import Component from '@glimmer/component';
import EmberObject from '@ember/object';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';

export default class AssetCheckoutFormComponent extends Component {
  @service ajax;
  @service house;
  @service modal;
  @service toast;

  @tracked assetForm = EmberObject.create({barcode: ''});

  @tracked barcodeNotFound = null;
  @tracked barcodeCheckedOut = null;
  @tracked isSubmitting = false;
  @tracked showHistory = false;

  @tracked assetExpired = null;

  constructor() {
    super(...arguments);

    const options = this.args.attachments.map((a) => [a.description, a.id]);
    options.unshift(['-', '']);
    this.attachmentOptions = options;
    this.args.registerCallback?.(this.checkForBlankOnNavigate);
  }

  /**
   * Clear out the search errors.
   */

  clearErrors() {
    this.barcodeNotFound = false;
    this.barcodeCheckedOut = null;
    this.assetExpired = null;
  }

  /**
   * Check out an asset
   * @param model
   * @returns {Promise<void>}
   */

  @action
  checkoutAsset(model) {
    const {barcode} = model;
    this.clearErrors();

    if (barcode.trim() === '') {
      this.modal.info(null, 'No barcode number was entered.');
      return;
    }

    this._performCheckout(model.barcode, model.attachment_id);
  }

  async _performCheckout(barcode, attachment_id, force = false) {
    this.isSubmitting = true;
    try {
      const data = {person_id: this.args.person.id, barcode, attachment_id};
      if (force) {
        data.force = 1;
      }
      const result = await this.ajax.post('asset/checkout', {data});

      switch (result.status) {
        case 'success':
          this.toast.success('Asset was successfully checked out.');
          this.assetForm = EmberObject.create({barcode: ''});
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
        case 'expired':
          this.assetExpired = result;
          this.forceBarcode = barcode;
          this.forceAttachmentId = attachment_id;
          break;

        case 'entity-assigned':
          this.modal.info('Asset Is Assigned', `Asset #${barcode} cannot be checked out because it has been assigned to ${result.entity}. Asset assignments differ from asset checkouts because assignments are for situations where the person does not have a Clubhouse account, such as Burn Perimeter Support or High Rock Security members, or where the asset is used by a team or service rather than an individual.`);
          break;

        default:
          this.modal.info('Unknown Status', `A bug was tripped over. The status ${result.status} is not known.`);
          break;
      }
    } catch (response) {
      this.house.handleErrorResponse(response)
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  forceCheckout() {
    this.assetExpired = null;
    this._performCheckout(this.forceBarcode, this.forceAttachmentId, true);
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

  /**
   * Check to see if the barcode field is blank, and allow the navigation to be tabbed away.
   *
   * @param resume
   */

  @action
  checkForBlankOnNavigate(resume) {
    if (this.assetForm.barcode.trim() === '') {
      resume();
      return;
    }

    this.modal.info('Asset not checked out', 'A barcode was entered, yet was not checked out. Either complete the check out process, or blank the barcode field before clicking on another tab.');
  }

  /**
   * Close up the expired asset dialog
   */

  @action
  closeExpiredDialog() {
    this.assetExpired = null;
  }
}
