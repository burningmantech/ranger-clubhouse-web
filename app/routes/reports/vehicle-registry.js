import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';

export default class ReportsPersonVehiclesRoute extends ClubhouseRoute {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const year = requestYear(params);
    this.year = year;
    return this.store.query('vehicle', { event_year: year });
  }

  setupController(controller, model) {
    controller.set('year', this.year);
    controller.set('person_vehicle', model);
    controller.set('filter', 'all');
    controller.set('numberFilter', '');
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
