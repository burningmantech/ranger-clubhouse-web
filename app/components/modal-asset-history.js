import Component from '@glimmer/component';
import { action } from '@ember/object';
import { set } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class modalAssetHistoryComponent extends Component {
  @tracked isLoading = false;
  @tracked history = [];

  @service ajax;
  @service house;
  @service toast;

  constructor() {
    super(...arguments);

    this.isLoading = true;
    this.ajax.request(`asset/${this.args.assetId}/history`)
      .then((results) => this.assetHistory = results.asset_history)
      .catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isLoading = false);
  }

  @action
  checkin(row) {
    this.ajax.request(`asset/${this.args.assetId}/checkin`, { method: 'POST' })
      .then((result) => {
        set(row, 'checked_in', result.checked_in);
        this.toast.success('Asset has been successfully checked in.');
      }).catch((response) => this.house.handleErrorResponse(response));
  }
}
