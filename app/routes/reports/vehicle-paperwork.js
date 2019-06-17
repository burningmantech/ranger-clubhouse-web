import Route from '@ember/routing/route';

export default class ReportsVehiclePaperworkRoute extends Route {
  model() {
    return this.ajax.request(`person/vehicle-paperwork`);
  }

  setupController(controller, model) {
    controller.set('people', model.people);
    controller.set('year', this.house.currentYear());
  }
}
