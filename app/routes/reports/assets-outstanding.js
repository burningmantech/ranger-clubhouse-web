import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';

export default class ReportsAssetsOutstandingRoute extends ClubhouseRoute {
  queryParams = {
    year: { refreshModel: true }
  };

  async model(params) {
    const year = requestYear(params);

    return {
      assets: (await this.ajax.request('asset', {
        data: { year, checked_out: 1 },
      })).asset,
      year
    };
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
