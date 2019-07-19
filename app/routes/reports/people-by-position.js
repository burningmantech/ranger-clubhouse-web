import Route from '@ember/routing/route';
import _ from 'lodash';

export default class PeopleByPositionRoute extends Route {
  queryParams = {
    onPlaya: { refreshModel: true }
  };

  model(params) {
    const onPlaya = !!params.onPlaya;
    this.set('onPlaya', onPlaya);
    return this.ajax.request('position/people-by-position', {data: {onPlaya: onPlaya ? 1 : 0}});
  }

  setupController(controller, model) {
    controller.set('positions', model.positions);
    controller.set('people', _.keyBy(model.people, 'id'));
    controller.set('onPlaya', this.onPlaya);
  }
}
