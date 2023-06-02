import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';
import {setting} from 'clubhouse/utils/setting';

export default class PersonController extends ClubhouseController {
  @action
  switchToHQ() {
    if (setting('HQWindowInterfaceEnabled')) {
      this.router.transitionTo('hq.index', this.person.id);
      return;
    }

    this.modal.info('HQ Interface Disabled', 'Sorry, the HQ Window Interface is only available pre-event week through end of the event.');
  }

}
