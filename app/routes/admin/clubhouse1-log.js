import Route from '@ember/routing/route';
import EmberObject from '@ember/object';

const Clubhouse1Events = {
  'email':     '#email,!email,#reminder',
  'emailfail': '!EMAIL',
  'password':  '#password-changed',
  'role':      '!ROLE',
  'login':     '#visit,#logout',
  'loginfail': '!NO-LOGIN',
  'invalid':   '!INVAL',
  'error':     '!ERR',
  'fatal':     '!FATAL',
  'sql':       '+,-,=',
  'db':        '!DB',
  'request':   '#REQ'
};

export default class AdminClubhouse1LogRoute extends Route {
  queryParams = {
    person: { refreshModel: true },
    start_time: { refreshModel: true },
    end_time: { refreshModel: true },
    event_text: { refreshModel: true },
    events: { refreshModel: true },
    text: { refreshModel: true },
    sort: { refreshModel: true },
    page: { refreshModel: true },
  };

  model(params) {
    // Take the query parameters, and build up the action log search parameters
    const searchParams = Object.keys(this.queryParams).reduce((hash, key) => {
      if (params[key]) {
        if (key == 'events') {
          // action log api expects a json array for events, while we
          // want a comma separated field on the url
          hash[key] = params[key].split(',').map((event) => Clubhouse1Events[event]).join(',');
        } else {
          hash[key] = params[key];
        }
      }
      return hash;
    }, {});

    this.set('searchParams', searchParams);
    this.set('params', params);
    return this.ajax.request('clubhouse1-log', { data: searchParams });
  }

  setupController(controller, model) {
    controller.set('error', model.error);
    controller.set('logs', model.logs);
    controller.set('total', model.total);
    controller.set('currentPage', model.page);
    controller.set('total_pages', model.total_pages);
    const query = EmberObject.create({ sort: 'desc' });
    if (this.params) {
      query.setProperties(this.params);
    }

    controller.set('query', query);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      Object.keys(this.queryParams).forEach((param) => controller.set(param, null));
      controller.set('logs', null);
    }
  }

}
