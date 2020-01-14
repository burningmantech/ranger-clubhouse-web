import Component from '@ember/component';
import { action, set } from '@ember/object';

export default class AssetTableComponent extends Component {
  tagName = '';
  assets = null;
  year = null;

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
    this.set('assetForHistory', asset);
  }

  @action
  closeHistory() {
    this.set('assetForHistory', null);
  }
}
