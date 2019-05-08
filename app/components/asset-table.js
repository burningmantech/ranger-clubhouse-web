import Component from '@ember/component';
import { set } from '@ember/object';
import { action } from '@ember/object';
import { argument } from '@ember-decorators/argument';
import { unionOf } from '@ember-decorators/argument/types';
import { tagName } from '@ember-decorators/component';

@tagName('')
export default class AssetTableComponent extends Component {
  @argument('object') assets;
  @argument(unionOf('string', 'number')) year;

  @action
  checkInAsset(asset, row) {
    this.ajax.request(`asset/${asset.id}/checkin`, { method: 'POST' })
      .then((result) => {
        set(row, 'checked_in', result.checked_in);
        this.toast.success('Asset has been successfully checked in.');
      }).catch((response) => this.house.handleErrorResponse(response));
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
