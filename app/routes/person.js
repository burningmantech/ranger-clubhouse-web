import Route from '@ember/routing/route';
import { Role } from 'clubhouse/constants/roles';
import RSVP from 'rsvp';

export default class PersonRoute extends Route {
  beforeModel() {
    super.beforeModel(...arguments);
    this.house.roleCheck([Role.ADMIN, Role.MANAGE]);
  }

  model(params) {
    const personId = params.person_id;

    return RSVP.hash({
      person: this.store.find('person', personId).then((person) => {
        return person.loadRangerInfo().then(() => { return person });
      }),
      messages: this.store.query('person-message', {person_id: personId})
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);

    controller.setProperties(model);
  }
}
