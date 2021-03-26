import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';
import { set } from '@ember/object';

export default class PersonBroadcastLogController extends ClubhouseController {
  queryParams = [ 'year' ];

  @action
  showMessageAction(log) {
    set(log, 'showMessage', !log.showMessage);
  }
}
