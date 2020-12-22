import Route from '@ember/routing/route';
import requestYear from 'clubhouse/utils/request-year';
import { isEmpty } from '@ember/utils';
import EmberObject from '@ember/object';

export default class AdminRbsMessageLog extends Route {
  queryParams = {
    year: { refreshModel: true },
    page: { refreshModel: true },
    status: { refreshModel: true },

  };

  model(params) {
    const year = requestYear(params);
    const page = params.page || 1;

    this.year = year;

    const data = { year, page };

    if (!isEmpty(params.status)) {
      data.status = params.status.split(',');
    }

    if (!isEmpty(params.direction)) {
      data.direction = params.direction;
    }

    this.direction = params.direction;
    this.status = params.status;

    return this.ajax.request('broadcast/messages', { data });
  }

  setupController(controller, model) {
    controller.set('messages', model.messages);
    controller.set('total', model.total);
    controller.set('currentPage', model.page);
    controller.set('total_pages', model.total_pages);
    controller.set('year', this.year);

    controller.set('searchForm', EmberObject.create({
      status: isEmpty(this.status) ? [] : this.status.split(','),
      direction: isEmpty(this.direction) ? null : this.direction
    }));
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
      controller.set('page', null);
      controller.set('status', null);
      controller.set('direction', null);
    }
  }
}
