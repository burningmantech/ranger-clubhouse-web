import Route from '@ember/routing/route';
import requestYear from 'clubhouse/utils/request-year';
import _ from 'lodash';

export default class ReportsRollcallRoute extends Route {
  model(params) {
    const year = requestYear(params);
    this.year = year;
    return this.ajax.request('slot', { data: { year } });
  }

  setupController(controller, model) {
    const positions = _.sortBy(_.map(_.groupBy(model.slot, 'position_id'), (slots) => {
      const position = slots[0].position;

      return {
        id: position.id,
        title: position.title,
        slots
      };
    }), 'title');

    controller.set('year', this.year);
    controller.set('positions', positions);
    controller.set('positionId', 0);
    controller.set('people', null);
  }
}
