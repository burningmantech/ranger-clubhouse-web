import Route from '@ember/routing/route';
import _ from 'lodash';

export default class PeopleByPositionRoute extends Route {
  queryParams = {
    onPlaya: { refreshModel: true }
  };

  model(params) {
    return this.ajax.request('position/people-by-position', {data: {onPlaya: params.onPlaya ? 1 : 0}});
  }

  setupController(controller, model) {
    controller.set('positions', model.positions);
    controller.set('people', _.keyBy(model.people, 'id'));
  }
}
