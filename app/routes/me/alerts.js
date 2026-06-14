import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class MeAlertsRoute extends ClubhouseRoute {
  async model() {
    const personId = this.session.userId;

    // Retrieve the alert preferences and SMS numbers
    return {
      alerts: (await this.ajax.request(`person/${personId}/alerts`)).alerts,
      numbers: (await this.ajax.request('sms', { method: 'GET', data: { person_id: personId }})).numbers
    };
  }

  setupController(controller, model) {
    controller.setProperties({ alerts: model.alerts, numbers: model.numbers, person: this.modelFor('me') });
  }
}
