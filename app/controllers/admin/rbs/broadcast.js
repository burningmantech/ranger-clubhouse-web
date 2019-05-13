import Controller from '@ember/controller';
import { Broadcasts } from 'clubhouse/constants/broadcast';
import { computed } from '@ember/object';

export default class AdminRbsBroadcastRoute extends Controller {
  queryParams = [ 'type' ];

  @computed('type')
  get title() {
    return Broadcasts[this.type].title;
  }
}
