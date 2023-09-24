import Component from '@glimmer/component';
import {action, set} from '@ember/object';
import {service} from '@ember/service';
import {tracked} from '@glimmer/tracking';
import { TypeLabels} from 'clubhouse/models/asset';

export default class HqAssetTableComponent extends Component {
  @service ajax;
  @service house;
  @service toast;

  @tracked updateAsset = null;

  constructor() {
    super(...arguments);

    const options = this.args.attachments.map((a) => [a.description, a.id]);
    options.unshift(['-', '']);
    this.attachmentOptions = options;
  }

  typeLabel(type) {
    return TypeLabels[type] ?? type;
  }

  /**
   * Check in a checked out asset
   *
   * @param {AssetPersonModel} ap
   */

  @action
  async assetCheckInAction(ap) {
    set(ap, 'isSubmitting', true);

    try {
      const result = await this.ajax.request(`asset/${ap.asset.id}/checkin`, {method: 'POST'});
      set(ap, 'checked_in', result.checked_in);
      this.toast.success('Asset has been successfully checked in.');
      this.args.onCheckIn?.(ap.asset);
    } catch (response) {
      this.house.handleErrorResponse(response)
    } finally {
      set(ap, 'isSubmitting', false);
    }
  }

  /**
   * Check in a checked out asset
   *
   * @param {AssetPersonModel} ap
   */

  @action
  changeAssetAttachment(ap) {
    this.updateAsset = ap;
  }

  /**
   * Close the attachment dialog
   */

  @action
  cancelAttachmentDialog() {
    this.updateAsset = null;
  }

  /**
   * Commit the asset attachment.
   *
   * @param model
   * @param isValid
   * @returns {Promise<void>}
   */

  @action
  async submitAsset(model, isValid) {
    if (!isValid) {
      return;
    }

    try {
      await model.save();
      this.updateAsset = null;
      this.toast.success('Attachment successfully updated.');
    } catch (response) {
      this.house.handleErrorResponse(response)
    }
  }
}
