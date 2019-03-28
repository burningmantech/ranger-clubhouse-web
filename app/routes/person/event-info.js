import Route from '@ember/routing/route';
import requestYear from 'clubhouse/utils/request-year';

export default class PersonEventInfoRoute extends Route {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const year = requestYear(params);
    const personId = this.modelFor('person').id;

    return this.ajax.request(`person/${personId}/event-info`, { data: { year } })
           .then((result) => result.event_info);

  }
  setupController(controller, model) {
    controller.set('person', this.modelFor('person'));
    controller.set('eventInfo', model);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
