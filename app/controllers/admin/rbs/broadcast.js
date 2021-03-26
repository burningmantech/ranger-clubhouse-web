import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { Broadcasts } from 'clubhouse/constants/broadcast';

export default class AdminRbsBroadcastRoute extends ClubhouseController {
  queryParams = [ 'type' ];

  get title() {
    return Broadcasts[this.type].title;
  }
}
