import Component from '@glimmer/component';
import { action, set } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class AssetTableComponent extends Component {
  @service asset;
  @service house;
  @service toast;

  // Asset ids with an in-flight check-in, used to disable the per-row button.
  @tracked submittingIds = new Set();

  @tracked updateAsset = null;

  constructor() {
    super(...arguments);

    const options = (this.args.attachments ?? []).map((a) => [a.description, a.id]);
    options.unshift(['-', '']);
    this.attachmentOptions = options;
  }

  get checkedOutAssets() {
    return (this.args.assets ?? []).filter((ap) => !ap.checked_in);
  }

  get checkedInAssets() {
    return (this.args.assets ?? []).filter((ap) => ap.checked_in);
  }

  get rows() {
    return this.args.mode === 'checkout' ? this.checkedOutAssets : this.checkedInAssets;
  }

  isSubmitting = (assetId) => this.submittingIds.has(assetId);

  @action
  async checkInAsset(asset, row) {
    if (this.submittingIds.has(asset.id)) {
      return;
    }
    this.submittingIds = new Set(this.submittingIds).add(asset.id);
    try {
      const result = await this.asset.checkin(asset.id);
      // Apply the result in place. Both AssetTable instances (checkout +
      // history) share the same asset-person records, so flipping checked_in
      // here moves the row out of the checkout partition and into the history
      // partition for both instances on the next render.
      set(row, 'checked_in', result.checked_in);
      set(row, 'check_in_person', result.check_in_person);
    } catch {
      // error already surfaced by the asset service
    } finally {
      const next = new Set(this.submittingIds);
      next.delete(asset.id);
      this.submittingIds = next;
    }
  }

  @action
  changeAssetAttachment(ap) {
    this.updateAsset = ap;
  }

  @action
  cancelAttachmentDialog() {
    this.updateAsset = null;
  }

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
      this.house.handleErrorResponse(response);
    }
  }
}
