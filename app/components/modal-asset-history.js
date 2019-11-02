import Component from '@ember/component';


import { action } from '@ember/object';
import { set } from '@ember/object';

export default class modalAssetHistoryComponent extends Component {
  assetId = null;
  onClose = null;

  isLoading = false;
  history = [];

  didReceiveAttrs() {
    this.set('isLoading', true);

    this.ajax.request(`asset/${this.assetId}/history`)
      .then((results) => this.set('assetHistory', results.asset_history))
      .catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.set('isLoading', false));
  }

  @action
  checkin(row) {
    this.ajax.request(`asset/${this.assetId}/checkin`, { method: 'POST' })
      .then((result) => {
        set(row, 'checked_in', result.checked_in);
        this.toast.success('Asset has been successfully checked in.');
      }).catch((response) => this.house.handleErrorResponse(response));
  }
}
