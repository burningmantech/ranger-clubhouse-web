import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';

export default class MeEmergencyContactController extends ClubhouseController {
  @action
  cancel() {
    this.router.transitionTo('me.homepage');
  }
}
