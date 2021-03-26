import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import _ from 'lodash';

export default class PeopleByPositionRoute extends ClubhouseRoute {
  queryParams = {
    onPlaya: { refreshModel: true }
  };

  model(params) {
    return this.ajax.request('position/people-by-position', {data: {onPlaya: params.onPlaya ? 1 : 0}});
  }

  setupController(controller, model) {
    controller.set('positions', model.positions);
    controller.set('people', _.keyBy(model.people, 'id'));
    controller.buildPositionTypes();
    controller.buildStatuses();
    controller.buildViewPositions();
  }
}
