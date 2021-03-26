import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import _ from 'lodash';

export default class VcHandleCheckerRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('handles')
        .then((result) => _.sortBy(result.data, [(h) => h.name.toLowerCase(), 'entityType']));
  }

  setupController(controller, model) {
    controller.set('model', model);
    controller.buildHandleRules();
    controller.buildEntityTypes();
    controller.incrementallyBuildAllHandles();
  }
}
