import Route from '@ember/routing/route';
import requestYear from 'clubhouse/utils/request-year';
import _ from "lodash";

export default class ReportsShiftSignupsRoute extends Route {
  queryParams = {
    year: {refreshModel: true}
  };

  model(params) {
    const year = requestYear(params);

    return this.ajax.request('slot/shift-signups-report', {data: {year}});
  }

  setupController(controller, model) {
    const {positions} = model;
    controller.set('positions', positions);
    controller.set('emptyPositions', _.orderBy(positions.filter((p) => p.total_empty > 0),
      ['total_empty'], ['desc']));
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
