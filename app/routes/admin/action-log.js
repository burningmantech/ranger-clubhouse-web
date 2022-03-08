import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import EmberObject from '@ember/object';

export default class AdminActionLogRoute extends ClubhouseRoute {
  queryParams = {
    person: {refreshModel: true},
    start_time: {refreshModel: true},
    end_time: {refreshModel: true},
    events: {refreshModel: true},
    sort: {refreshModel: true},
    page: {refreshModel: true},
  };

  model(params) {
    // Take the query parameters, and build up the action log search parameters
    const searchParams = Object.keys(this.queryParams).reduce((hash, key) => {
      if (params[key]) {
        if (key === 'events') {
          // action log api expects a json array for events, while we
          // want a comma separated field on the url
          hash[key] = params[key].split(',');
        } else {
          hash[key] = params[key];
        }
      }
      return hash;
    }, {});

    this.searchParams = searchParams;
    return this.ajax.request('action-log', {data: searchParams}).catch((response) => {
      if (response.status !== 422) {
        throw response;
      }
      return {
        error: response.payload.errors[0].title,
        action_logs: [],
        meta: {}
      }
    });
  }

  setupController(controller, model) {
    controller.set('error', model.error);
    controller.set('logs', model.action_logs);
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
