import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import _ from 'lodash';

export default class VcHandleCheckerRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('handle-reservation/handles');
  }

  setupController(controller, model) {
    let {handles} = model;
    handles = _.sortBy(handles, [(h) => h.name.toLowerCase(), 'entityType'])
    // help rendering performance by giving a key hint.
    handles.forEach((h, idx) => h.keyIdx = idx);
    controller.allHandles = handles;
    controller.buildHandleRules();
    controller.buildEntityTypes();
  }
}
