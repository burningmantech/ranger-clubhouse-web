import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import _ from 'lodash';

export default class VcHandleCheckerRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('handles')
        .then((result) => _.sortBy(result.data, [(h) => h.name.toLowerCase(), 'entityType']));
  }

  setupController(controller, model) {
    // help rendering performance by giving a key hint.
    model.forEach((h,idx) => h.keyIdx = idx);
    controller.set('allHandles', model);
    controller.buildHandleRules();
    controller.buildEntityTypes();
  }
}
