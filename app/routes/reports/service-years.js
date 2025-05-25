import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class ReportsServiceYearsRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request(`award/service-years`);
  }

  setupController(controller, model) {
    controller.set('serviceYears', model.serviceYears);
  }

  resetController(controller, isExiting) {
    if (!isExiting) {
      return;
    }

    controller.set('showAll', false);
  }
}
