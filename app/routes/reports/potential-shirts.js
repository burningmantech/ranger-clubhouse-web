import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';
import shirtGroupsSort from 'clubhouse/utils/shirt-groups-sort';

export default class ReportsPotentialShirtsRoute extends ClubhouseRoute {
  queryParams = {
    year: { refreshModel: true },
  };

  model(params) {
    const year = requestYear(params);

    this.year = year;
    return this.ajax.request(`swag/potential-shirts-earned`, {
      data: { year }
    });
  }

  setupController(controller, model) {
    controller.set('year', this.year);
    controller.setProperties(model);
    controller.set('shirtGroups', shirtGroupsSort(model.people));

  }

  resetController(controller, isExiting) {
    if (!isExiting) {
      return;
    }

    controller.set('year', null);
    controller.set('shirtGroups', null);
    controller.set('people', null);
  }
}
