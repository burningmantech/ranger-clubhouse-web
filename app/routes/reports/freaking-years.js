import Route from '@ember/routing/route';

export default class ReportsFreakingYearsRoute extends Route {
  queryParams = {
    showAll: { refreshModel: true }
  };

  model(params) {
    const query = {};
    if (params.showAll) {
      query.include_all = 1;
    }
    return this.ajax.request(`timesheet/freaking-years`, { data: query });
  }

  setupController(controller, model) {
    controller.setProperties(model);
  }

  resetController(controller, isExiting) {
    if (!isExiting) {
      return;
    }

    controller.set('showAll', false);
  }
}
