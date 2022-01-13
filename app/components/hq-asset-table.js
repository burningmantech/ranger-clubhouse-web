import Component from '@glimmer/component';
import { action, set } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class HqAssetTableComponent extends Component {
  @service ajax;
  @service house;
  @service toast;

  @tracked updateAsset = null;

  /**
   * Check in a checked out asset
   *
   * @param {AssetPersonModel} ap
   */

  @action
  assetCheckInAction(ap) {
    set(ap, 'isSubmitting', true);
    this.ajax.request(`asset/${ap.asset.id}/checkin`, {method: 'POST'})
      .then((result) => {
        set(ap, 'checked_in', result.checked_in);
        this.toast.success('Asset has been successfully checked in.');
      }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => set(ap, 'isSubmitting', false));
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

  @action
  cancelAttachmentDialog() {
    this.updateAsset = null;
  }

  /**
   * Build an attachment list
   *
   * @returns {[]}
   */

  get attachmentOptions() {
    const options =  this.args.attachments.map((a) => [a.description, a.id]);
    options.unshift([ '-', '']);
    return options;
  }

  @action
  submitAsset(model, isValid) {
    if (!isValid) {
      return;
    }

    model.save().then(() => {
      this.updateAsset = null;
      this.toast.success('Attachment successfully updated.');
    }).catch((response) => this.house.handleErrorResponse(response));
  }
}
