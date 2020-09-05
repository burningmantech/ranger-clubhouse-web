import Route from '@ember/routing/route';
import EmberObject from '@ember/object';
import { isEmpty } from '@ember/utils';

export default class AdminMotdRoute extends Route {
  queryParams = {
    audience: { refreshModel: true},
    type: { refreshModel: true },
    sort: { refreshModel: true },
    page: { refreshModel: true },
    page_size: { refreshModel: true }
  };

  model(params) {
    const query = Object.keys(this.queryParams).reduce((hash, key) => {
      if (params[key]) {
        hash[key] = params[key];
      }
      return hash;
    }, {});

    if (!query.page_size) {
      query.page_size = 20;
    }

    if (!query.page) {
      query.page = 1;
    }

    this.searchParams = query;
    this.store.unloadAll('motd');
    return this.store.query('motd', query);
  }

  setupController(controller, model) {
    controller.set('motds', model);
    const meta = model.meta;
    controller.set('total', meta.total);
    controller.set('currentPage', meta.page);
    controller.set('total_pages', meta.total_pages);
    controller.set('table_count', meta.table_count);

    const query = EmberObject.create({sort: 'desc'});
    query.setProperties(this.searchParams);
    if (isEmpty(query.type)) {
      query.type = 'all';
    }
    if (isEmpty(query.audience)) {
      query.audience = 'all';
    }
    controller.set('query', query);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      Object.keys(this.queryParams).forEach((param) => controller.set(param, null));
    }
  }
}
