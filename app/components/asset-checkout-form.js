import Component from '@glimmer/component';
import EmberObject from '@ember/object';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import {
  CHECKOUT_SUCCESS,
  CHECKOUT_NOT_FOUND,
  CHECKOUT_CHECKED_OUT,
  CHECKOUT_EXPIRED,
  CHECKOUT_ENTITY_ASSIGNED,
  ENTITY_ASSIGNED_MESSAGE,
  UNKNOWN_STATUS_MESSAGE,
  NAVIGATE_AWAY_WARNING,
} from 'clubhouse/utils/asset-checkout-status';

export default class AssetCheckoutFormComponent extends Component {
  @service ajax;
  @service house;
  @service modal;
  @service toast;

  @tracked assetForm = EmberObject.create({barcode: ''});

  // Error/result state. notFoundBarcode holds the barcode string when a
  // not-found result comes back (null when there is no such error) - the
  // template both gates on it and prints it, so it intentionally carries a
  // payload rather than being a boolean. Initialized and reset to the same
  // sentinel (null) everywhere.
  @tracked notFoundBarcode = null;
  @tracked barcodeCheckedOut = null;
  @tracked assetExpired = null;
  @tracked isSubmitting = false;

  // Retry payload for force-checkout, captured from the 'expired' result and
  // consumed by forceCheckout(). Declared explicitly (not tracked - not
  // rendered) so the cross-call state is visible at the top of the class.
  forceBarcode = null;
  forceAttachmentId = null;

  constructor() {
    super(...arguments);

    const options = this.args.attachments.map((a) => [a.description, a.id]);
    options.unshift(['-', '']);
    this.attachmentOptions = options;
    this.args.registerCallback?.(this.checkForBlankOnNavigate);
  }

  /**
   * Clear out the search/result errors.
   */
  clearErrors() {
    this.notFoundBarcode = null;
    this.barcodeCheckedOut = null;
    this.assetExpired = null;
  }

  /**
   * Check out an asset.
   * @param model
   */
  @action
  checkoutAsset(model) {
    const barcode = (model.barcode ?? '').trim();
    this.clearErrors();

    if (barcode === '') {
      this.modal.info(null, 'No barcode number was entered.');
      return;
    }

    this.performCheckout(barcode, model.attachment_id);
  }

  /**
   * POST the checkout request and dispatch on the result. Transport is kept
   * thin; per-status UI handling lives in handleCheckoutResult so it can be
   * reasoned about (and tested) independently of the network call.
   */
  async performCheckout(barcode, attachment_id, force = false) {
    this.isSubmitting = true;
    try {
      const data = {
        person_id: this.args.person.id,
        barcode,
        attachment_id: attachment_id || null,
      };
      if (force) {
        data.force = 1;
      }
      const result = await this.ajax.post('asset/checkout', {data});
      this.handleCheckoutResult(result, barcode, attachment_id);
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Apply the per-status side effects of a checkout result.
   */
  async handleCheckoutResult(result, barcode, attachment_id) {
    switch (result.status) {
      case CHECKOUT_SUCCESS:
        this.toast.success('Asset was successfully checked out.');
        this.assetForm = EmberObject.create({barcode: ''});
        await this.args.assets.update();
        this.args.onCheckOut?.(result.asset);
        break;

      case CHECKOUT_NOT_FOUND:
        this.notFoundBarcode = barcode;
        break;

      case CHECKOUT_CHECKED_OUT:
        result.barcode = barcode;
        this.barcodeCheckedOut = result;
        break;

      case CHECKOUT_EXPIRED:
        this.assetExpired = result;
        this.forceBarcode = barcode;
        this.forceAttachmentId = attachment_id;
        break;

      case CHECKOUT_ENTITY_ASSIGNED:
        this.modal.info('Asset Is Assigned', ENTITY_ASSIGNED_MESSAGE(barcode, result.entity));
        break;

      default:
        this.modal.info('Unknown Status', UNKNOWN_STATUS_MESSAGE(result.status));
        break;
    }
  }

  @action
  forceCheckout() {
    this.assetExpired = null;
    this.performCheckout(this.forceBarcode, this.forceAttachmentId, true);
  }

  /**
   * Check whether the barcode field is blank, allowing navigation away.
   * @param resume
   */
  @action
  checkForBlankOnNavigate(resume) {
    if (this.assetForm.barcode.trim() === '') {
      resume();
      return;
    }

    this.modal.info('Asset not checked out', NAVIGATE_AWAY_WARNING);
  }

  /**
   * Close the expired asset dialog.
   */
  @action
  closeExpiredDialog() {
    this.assetExpired = null;
  }
}
