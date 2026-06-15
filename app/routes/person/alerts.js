import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class PersonAlertsRoute extends ClubhouseRoute {
  async model() {
    const personId = this.modelFor('person').id;

    // Retrieve the alert preferences and SMS numbers
    return {
      alerts: (await this.ajax.request(`person/${personId}/alerts`)).alerts,
      numbers: (await this.ajax.request('sms', { method: 'GET', data: { person_id: personId }})).numbers
    };
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.setProperties({ alerts: model.alerts, numbers: model.numbers });
    controller.set('person', this.modelFor('person'));
  }
}
