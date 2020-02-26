import Route from '@ember/routing/route';
import {Role} from 'clubhouse/constants/roles';
import { A } from '@ember/array';
import requestYear from 'clubhouse/utils/request-year';

export default class VcUnifiedFlaggingRoute extends Route {
  queryParams = {
    year: {refreshModel: true}
  };

  beforeModel() {
    super.beforeModel(...arguments);
    this.house.roleCheck(Role.INTAKE);
  }

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
