import Route from '@ember/routing/route';
import requestYear from 'clubhouse/utils/request-year';
import _ from 'lodash';

export default class ReportsShirtsRoute extends Route {
  queryParams = {
    year: { refreshModel: true },
  };

  model(params) {
    const year = requestYear(params);

    this.set('year', year);
    return this.ajax.request(`timesheet/shirts-earned`, {
      data: { year }
    });
  }

  setupController(controller, model) {
    controller.set('year', this.year);
    controller.setProperties(model);

    const shortSleeve = _.sortBy(_.map(_.groupBy(model.people, 'teeshirt_size_style'), (group, type) => {
      return { type, count: group.length }
    }), 'type');

    const longSleeve = _.sortBy(_.map(_.groupBy(model.people, 'longsleeveshirt_size_style'), (group, type) => {
      return { type, count: group.length }
    }), 'type');

    controller.set('shirtGroups', [
      {
        name: 'Tee Shirts',
        exportName: 'tee-shirts',
        types: shortSleeve
      },
      {
        name: 'Long Sleeves',
        exportName: 'long-sleeves',
        types: longSleeve
      }
    ]);

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
