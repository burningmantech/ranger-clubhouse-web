import Route from '@ember/routing/route';
import requestYear from 'clubhouse/utils/request-year';
import { action } from '@ember/object';

export default class AdminRbsBroadcastLog extends Route {
  queryParams = {
    failed: { refreshModel: true },
    year: { refreshModel: true }
  }

  model(params) {
    const year = requestYear(params);
    const data = { year };
    this.set('year', year);

    if (params.failed) {
      data.failed = 1;
    }

    return this.ajax.request('broadcast', { data });
  }

  setupController(controller, model) {
    controller.set('logs', model.logs);
    controller.set('retryBroadcast', null);
    controller.set('retryResults', null);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
      controller.set('failed', null);
    }
  }

  @action
  refreshRoute() {
    this.refresh();
  }
}
