import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import _, {isEmpty} from 'lodash';

export default class VcHandleCheckerRoute extends ClubhouseRoute {
  queryParams = {
    handle: { refreshModel: true }
  };

  model({handle}) {
    this.handle = handle;
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

    if (!isEmpty(this.handle)) {
      controller.currentName = this.handle;
      controller.checkCurrentName();
    } else {
      controller.currentName = '';
    }
  }
}
