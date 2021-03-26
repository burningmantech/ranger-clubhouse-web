import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import RSVP from 'rsvp';

export default class PersonAlertsRoute extends ClubhouseRoute {
  model() {
    const personId = this.modelFor('person').id;

    // Retrieve the alert preferences and SMS numbers
    return RSVP.hash({
      alerts: this.ajax.request(`person/${personId}/alerts`).then((result) => result.alerts),
      numbers: this.ajax.request('sms', { method: 'GET', data: { person_id: personId }}).then((result) => result.numbers)
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.setProperties({ alerts: model.alerts, numbers: model.numbers });
    controller.set('person', this.modelFor('person'));
  }
}
