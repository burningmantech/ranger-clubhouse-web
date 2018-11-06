import Route from '@ember/routing/route';
import MeRouteMixin from 'clubhouse/mixins/route/me';

export default class MeAlertsRoute extends Route.extend(MeRouteMixin) {
  model() {
    const personId = this.session.user.id;
    return this.ajax.request(`person/${personId}/alerts`).then((result) => {
      return result.alerts;
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.set('alerts', model);
  }
}
