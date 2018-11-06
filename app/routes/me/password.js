import Route from '@ember/routing/route';
import EmberObject from '@ember/object';
import MeRouteMixin from 'clubhouse/mixins/route/me';

class PasswordModel extends EmberObject {
  password_old = '';
  password = '';
  password_confirmation = '';
}

export default class MePasswordRoute extends Route.extend(MeRouteMixin) {
  setupController(controller) {
    super.setupController(...arguments);
    controller.set('password', PasswordModel.create())
  }
}
