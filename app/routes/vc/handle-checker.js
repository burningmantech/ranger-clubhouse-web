import Route from '@ember/routing/route';
import _ from 'lodash';

export default class VcHandleCheckerRoute extends Route {
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
