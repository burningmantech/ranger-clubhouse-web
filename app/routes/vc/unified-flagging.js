import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {INTAKE} from 'clubhouse/constants/roles';
import { A } from '@ember/array';
import requestYear from 'clubhouse/utils/request-year';

export default class VcUnifiedFlaggingRoute extends ClubhouseRoute {
  roleRequired = INTAKE;

  queryParams = {
    year: {refreshModel: true}
  };

  model(params) {
    const year = requestYear(params);
    this.year = year;
    return this.ajax.request('intake', {data: {year}});
  }

  setupController(controller, model) {
    controller.set('people', A(model.people));
    controller.set('year', this.year);
  }
}
