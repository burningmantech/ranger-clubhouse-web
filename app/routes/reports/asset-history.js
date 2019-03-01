import Route from '@ember/routing/route';
import requestYear from 'clubhouse/utils/request-year';
import RSVP from 'rsvp';

export default class ReportsAssetHistoryRoute extends Route {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const year = requestYear(params);

    return RSVP.hash({
      assets: this.ajax.request('asset', {
        data: { year, include_history: 1, exclude: "radio" },
      }).then((result) => result.asset ),
      year
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.setProperties(model);
  }
}
