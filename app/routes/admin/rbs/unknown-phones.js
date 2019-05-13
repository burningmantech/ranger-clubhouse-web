import Route from '@ember/routing/route';
import requestYear from 'clubhouse/utils/request-year';

export default class AdminRbsUnknownPhonesRoute extends Route {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const year = requestYear(params);

    return this.ajax.request('rbs/unknown-phones', { data: { year }});
  }

  setupController(controller, model) {
    controller.set('phones', model.phones);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
