import Route from '@ember/routing/route';
import EmberObject from '@ember/object';
import { action } from '@ember-decorators/object';

export default class AdminActionLogRoute extends Route {
  queryParams = {
    person: { refreshModel: true },
    target_person: { refreshModel: true },
    start_time: { refreshModel: true },
    end_time: { refreshModel: true },
    events: { refreshModel: true },
    sort: { refreshModel: true },
    page: { refreshModel: true },
  };

  model(params) {
    // Take the query parameters, and build up the action log search parameters
    const searchParams = Object.keys(this.queryParams).reduce((hash,key) => {
        if (params[key]) {
          if (key == 'events') {
            // action log api expects a json array for events, while we
            // want a comma separated field on the url
            hash.events = params[key].split(',');
          } else {
            hash[key] = params[key];
          }} return hash; }, {});
    this.set('searchParams', searchParams);
    return this.ajax.request('action-log', { data: searchParams  });
  }

  setupController(controller, model) {
    controller.set('logs', model.logs);
    controller.set('total', model.total);
    controller.set('currentPage', model.page);
    controller.set('total_pages', model.total_pages);
    const query = EmberObject.create({ sort: 'desc' });
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
