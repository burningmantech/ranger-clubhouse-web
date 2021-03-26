import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class ReportsVehiclePaperworkRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request(`vehicle/paperwork`);
  }

  setupController(controller, model) {
    controller.set('people', model.people);
    controller.set('year', this.house.currentYear());
  }
}
