import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import RSVP from 'rsvp';

import { Role } from 'clubhouse/constants/roles';

export default class PersonRoute extends Route.extend(AuthenticatedRouteMixin) {
  beforeModel() {
    super.beforeModel(...arguments);
    this.house.roleCheck([Role.ADMIN, Role.MANAGE, Role.VC, Role.MENTOR, Role.TRAINER]);
  }

  model(params) {
    const personId = params.person_id;

    return RSVP.hash({
      person: this.store.find('person', personId).then((person) => {
        return person.loadRangerInfo().then(() => { return person });
      }),
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);

    controller.setProperties(model);
  }
}
