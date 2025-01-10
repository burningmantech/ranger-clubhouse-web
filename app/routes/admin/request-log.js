import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import EmberObject from '@ember/object';

export default class AdminRequestLogRoute extends ClubhouseRoute {
  queryParams = {
    start_time: {refreshModel: true},
    end_time: {refreshModel: true},
    sort: {refreshModel: true},
    page: {refreshModel: true},
    message: {refreshModel: true},
  };

  model(params) {
    // Take the query parameters, and build up the action log search parameters
    this.searchParams = Object.keys(this.queryParams).reduce((hash, key) => {
      if (params[key]) {
        hash[key] = params[key];
      }
      return hash;
    }, {});

    return this.ajax.request('request-log', {data: this.searchParams}).catch((response) => {
      if (response.status !== 422) {
        throw response;
      }
      return {
        error: response.payload.errors[0].title,
        request_log: [],
        meta: {}
      }
    });
  }

  setupController(controller, model) {
    model.request_log?.forEach((a) => {
      const ips = a.ips?.split(',');
      if (ips) {
        a.ip = ips[ips.length - 1];
      }
    });
    controller.set('logs', model.request_log);
    controller.set('error', model.error);
    const meta = model.meta;
    controller.set('total', meta.total);
    controller.set('currentPage', meta.page);
    controller.set('total_pages', meta.total_pages);
    const query = EmberObject.create({sort: 'desc'});
    query.setProperties(this.searchParams);
    controller.set('query', query);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      Object.keys(this.queryParams).forEach((param) => controller.set(param, null));
      controller.set('logs', null);
    }
  }
}
