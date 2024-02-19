import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import { Broadcasts } from 'clubhouse/constants/broadcast';

export default class OpsRbsBroadcastRoute extends ClubhouseRoute {
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
    controller.set('config', this.modelFor('ops.rbs').config);
    controller.set('broadcast', model.details);
  }
}
