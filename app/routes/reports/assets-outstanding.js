import Route from '@ember/routing/route';
import requestYear from 'clubhouse/utils/request-year';
import RSVP from 'rsvp';

export default class ReportsAssetsOutstandingRoute extends Route {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const year = requestYear(params);

    return RSVP.hash({
      assets: this.ajax.request('asset', {
        data: { year, checked_out: 1 },
      }).then((result) => result.asset ),
      year
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.setProperties(model);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
