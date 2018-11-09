import Route from '@ember/routing/route';
import MeRouteMixin from 'clubhouse/mixins/route/me';
import RSVP from 'rsvp';

export default class MeAlertsRoute extends Route.extend(MeRouteMixin) {
  model() {
    const personId = this.session.user.id;

    // Retrieve the alert preferences and SMS numbers
    return RSVP.hash({
      alerts: this.ajax.request(`person/${personId}/alerts`).then((result) => result.alerts),
      numbers: this.ajax.request('sms', { method: 'GET', data: { person_id: personId }}).then((result) => result.numbers)
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);

    // Setup the phone form
    const numbers = model.numbers;
    controller.set('alerts', model.alerts);
    controller.set('numbers', numbers);
    controller.set('phoneForm.off_playa', numbers.off_playa.phone);
    controller.set('phoneForm.on_playa', numbers.on_playa.phone);
    controller.set('phoneForm.is_same', numbers.is_same);
  }
}
