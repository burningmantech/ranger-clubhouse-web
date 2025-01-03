import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class AdminErrorLogRoute extends ClubhouseRoute {
  queryParams = {
    person_id: {refreshModel: true},
    sort: {refreshModel: true},
    starts_at: {refreshModel: true},
    ends_at: {refreshModel: true},
    component: {refreshModel: true},
    page: {refreshModel: true},
    page_size: {refreshModel: true}
  };

  model(params) {
    return this.ajax.request('error-log', {data: params});
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.setProperties(model.meta);
    controller.set('error_logs', model.error_logs);
  }
}
