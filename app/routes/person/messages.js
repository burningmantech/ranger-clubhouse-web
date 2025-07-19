import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, MESSAGE_MANAGEMENT, VC} from 'clubhouse/constants/roles';

export default class PersonMessagesRoute extends ClubhouseRoute {
  beforeModel(transition) {
    const personId = +this.modelFor('person').id;

    if (this.session.hasRole([ADMIN, VC, MESSAGE_MANAGEMENT])
      || personId === this.session.userId
      || this.session.isEMOPEnabled) {
      return super.beforeModel(transition);
    } else {
      this.modal.info(
        'Permission Denied',
        'You only have access to another account\'s messages while the event is happening.'
      );
      this.router.transitionTo('person.index');
      return false;
    }
  }

  setupController(controller) {
    controller.person = this.modelFor('person');
  }
}
