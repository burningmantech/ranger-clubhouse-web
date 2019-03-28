import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';

export default class PersonAssetsController extends Controller {
  assets = [];
  queryParams = [ 'year' ];

  @action
  changeYearAction(year) {
    this.set('year', year);
  }

  @action
  checkInAction(asset) {
    asset.checkInAction().then(() => {
      this.toast.success('Asset has been successfully checked in.');
      this.assets.update();
    }).catch((response) => this.house.handleErrorResponse(response));
  }
}
