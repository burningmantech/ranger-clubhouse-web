import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';

export default class HqAssetsController extends Controller {
  @action
  checkInAction(asset) {
    asset.checkInAction().then(() => {
      this.toast.success('Asset has been successfully checked in.');
      this.assets.update();
    }).catch((response) => this.house.handleErrorResponse(response));
  }
}
