import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class MeVehiclesRoute extends ClubhouseRoute {
  async model() {
    const year = this.house.currentYear();
    this.year = year;
    const person = this.modelFor('me');

    const info = (await this.ajax.request(`vehicle/info/${person.id}`)).info;

    if (!info.mvr_eligible) {
      this.toast.error('Sorry, you are not MVR eligible.');
      this.router.transitionTo('me.homepage');
      return;
    }

    let vehicles;
    if (info.vehicle_requests_allowed) {
      vehicles = await this.store.query('vehicle', {person_id: this.session.userId, event_year: year});
    } else {
      vehicles = null;
    }

    return {
      info,
      person,
      vehicles,
    };
  }

  setupController(controller, model) {
    controller.set('vehicles', model.vehicles);
    controller.set('vehicleInfo', model.info);
    controller.set('person', model.person);
    controller.set('year', this.year);
    controller.showAgreementTag = null;
  }
}
