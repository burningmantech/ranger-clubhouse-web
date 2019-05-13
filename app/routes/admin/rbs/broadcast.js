import Route from '@ember/routing/route';
import { Broadcasts } from 'clubhouse/constants/broadcast';

export default class AdminRbsBroadcastRoute extends Route {
  queryParams = {
    type: { refreshModel: true }
  };

  model({ type }) {
    if (!Broadcasts[type]) {
      throw new Error(`Invalid broadcast type=[${type}]`);
    }

    return this.ajax.request('rbs/details', { data: { type }});
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.set('config', this.modelFor('admin.rbs').config);
    controller.set('broadcast', model.details);
  }
}
