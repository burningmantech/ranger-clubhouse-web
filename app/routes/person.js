import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

import { Role } from 'clubhouse/constants/roles';

export default class PersonRoute extends Route.extend(AuthenticatedRouteMixin) {
  beforeModel() {
    super.beforeModel(...arguments);
    this.house.roleCheck([Role.ADMIN, Role.MANAGE, Role.VC, Role.MENTOR, Role.TRAINER]);
  }

  model(params) {
    return this.store.find('person', params.person_id).then((person) => {
        return person.loadUserInfo().then(() => { return person });
      });
  }

  setupController(controller, model) {
    super.setupController(...arguments);

    controller.set('person', model);
  }
}
