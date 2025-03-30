import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, MESSAGE_MANAGEMENT, VC} from 'clubhouse/constants/roles';

export default class PersonMessagesRoute extends ClubhouseRoute {
  model() {
    const person_id = +this.modelFor('person').id;

    if (this.session.hasRole([ADMIN, VC, MESSAGE_MANAGEMENT])
      || person_id === this.session.userId
      || this.session.isEMOPEnabled) {
      this.canAccessMessages = true;
      this.store.unloadAll('person-message');
      return this.store.query('person-message', {person_id})
    } else {
      this.canAccessMessages = false;
      return [];
    }
  }

  setupController(controller, model) {
    controller.set('person', this.modelFor('person'));
    controller.person.set('unread_message_count', model.reduce((total, msg) => ((msg.delivered ? 0 : 1) + total), 0));
    controller.set('messages', model);
    controller.set('canAccessMessages', this.canAccessMessages);
  }
}
