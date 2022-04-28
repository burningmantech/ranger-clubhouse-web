import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';
import { INTAKE } from 'clubhouse/constants/roles';

export default class TrainingUnifiedFlaggingRoute extends ClubhouseRoute {
  roles = [ INTAKE ];

  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const year = requestYear(params);
    this.year = year;
    return this.ajax.request('intake', {data: {year}});
  }

  setupController(controller, model) {
    controller.set('people', model.people);
    controller.set('year', this.year);
  }
}
