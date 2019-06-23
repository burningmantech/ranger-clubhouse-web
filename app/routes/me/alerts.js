import Route from '@ember/routing/route';
import MeRouteMixin from 'clubhouse/mixins/route/me';
import RSVP from 'rsvp';

export default class MeAlertsRoute extends Route.extend(MeRouteMixin) {
  model() {
    const personId = this.session.userId;

    // Retrieve the alert preferences and SMS numbers
    return RSVP.hash({
      alerts: this.ajax.request(`person/${personId}/alerts`).then((result) => result.alerts),
      numbers: this.ajax.request('sms', { method: 'GET', data: { person_id: personId }}).then((result) => result.numbers)
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.setProperties({ alerts: model.alerts, numbers: model.numbers });
  }
}
