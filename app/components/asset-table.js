import Component from '@glimmer/component';
import { action, set } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class AssetTableComponent extends Component {
  @tracked assetForHistory = null;

  @service ajax;
  @service house;
  @service toast;

  @action
  checkInAsset(asset, row) {
    set(asset, 'isSubmitting', true);
    this.ajax.request(`asset/${asset.id}/checkin`, { method: 'POST' })
      .then((result) => {
        set(row, 'checked_in', result.checked_in);
        this.toast.success('Asset has been successfully checked in.');
      }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => set(asset, 'isSubmitting', false))
  }

  @action
  showHistoryAction(asset) {
    this.assetForHistory = asset;
  }

  @action
  closeHistory() {
    this.assetForHistory = null;
  }
}
