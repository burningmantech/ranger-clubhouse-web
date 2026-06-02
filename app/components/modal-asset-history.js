import Component from '@glimmer/component';
import { action, set } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class ModalAssetHistoryComponent extends Component {
  @service asset;
  @service ajax;
  @service house;

  @tracked isLoading = false;
  @tracked assetHistory = [];
  @tracked submittingRows = new Set();

  constructor() {
    super(...arguments);

    this.isLoading = true;
    this.ajax.request(`asset/${this.args.assetId}/history`)
      .then((results) => this.assetHistory = results.asset_history ?? [])
      .catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isLoading = false);
  }

  isSubmitting = (row) => this.submittingRows.has(row);

  @action
  async checkin(row) {
    if (this.submittingRows.has(row)) {
      return;
    }
    this.submittingRows = new Set(this.submittingRows).add(row);
    try {
      const result = await this.asset.checkin(this.args.assetId);
      set(row, 'checked_in', result.checked_in);
      set(row, 'check_in_person', result.check_in_person);
    } catch {
      // error already surfaced by the asset service
    } finally {
      const next = new Set(this.submittingRows);
      next.delete(row);
      this.submittingRows = next;
    }
  }
}
