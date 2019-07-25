import Route from '@ember/routing/route';
import MeRouteMixin from 'clubhouse/mixins/route/me';

export default class MePersonInfoRoute extends Route.extend(MeRouteMixin) {
  setupController(controller) {
    super.setupController(...arguments);
    controller.set('isSaved', false);
  }
}
