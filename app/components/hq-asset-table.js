import Component from '@glimmer/component';
import {action, set} from '@ember/object';
import {service} from '@ember/service';
import {tracked} from '@glimmer/tracking';

export default class HqAssetTableComponent extends Component {
  @service ajax;
  @service errors;
  @service saveModel;
  @service toast;

  @tracked updateAsset = null;
  @tracked isSubmitting = false;
  @tracked submittingIds = new Set();

  /**
   * The options shown in the "Change Attachment" select, derived from the
   * attachments passed in by the parent. A leading blank option allows the
   * attachment to be cleared.
   *
   * @returns {Array<[string, (string|number)]>}
   */

  get attachmentOptions() {
    const options = this.args.attachments.map((a) => [a.description, a.id]);
    options.unshift(['-', '']);
    return options;
  }

  isRowSubmitting = (assetId) => this.submittingIds.has(assetId);

  /**
   * Check in a checked out asset.
   *
   * @param {AssetPersonModel} ap
   */

  @action
  async assetCheckInAction(ap) {
    this.submittingIds = new Set(this.submittingIds).add(ap.asset.id);

    try {
      const result = await this.ajax.request(`asset/${ap.asset.id}/checkin`, {method: 'POST'});

      if (this.isDestroying) {
        return;
      }

      set(ap, 'checked_in', result.checked_in);
      this.toast.success('Asset has been successfully checked in.');
      this.args.onCheckIn?.(ap.asset);
    } catch (response) {
      this.errors.handleErrorResponse(response)
    } finally {
      const next = new Set(this.submittingIds);
      next.delete(ap.asset.id);
      this.submittingIds = next;
    }
  }

  /**
   * Open the dialog to change an asset's attachment.
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
   * @param model the ember-changeset wrapping the asset-person record
   * @param isValid
   * @returns {Promise<void>}
   */

  @action
  async submitAsset(model, isValid) {
    if (!isValid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    try {
      if (await this.saveModel.save({model, message: 'Attachment successfully updated.'})) {
        // The `attachment` association is read-only and is not necessarily
        // re-embedded by the save response. Re-derive the displayed attachment
        // from the chosen option so the table reflects the new selection.
        const attachmentId = model.attachment_id;
        const attachment = (this.args.attachments ?? []).find((a) => `${a.id}` === `${attachmentId}`) ?? null;
        set(model, 'attachment', attachment);
        this.updateAsset = null;
      }
    } finally {
      this.isSubmitting = false;
    }
  }
}
