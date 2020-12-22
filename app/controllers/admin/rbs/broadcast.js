import Controller from '@ember/controller';
import { Broadcasts } from 'clubhouse/constants/broadcast';

export default class AdminRbsBroadcastRoute extends Controller {
  queryParams = [ 'type' ];

  get title() {
    return Broadcasts[this.type].title;
  }
}
