import Route from '@ember/routing/route';
import requestYear from 'clubhouse/utils/request-year';

export default class PersonEventInfoRoute extends Route {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const year = requestYear(params);
    const personId = this.modelFor('person').person.id;

    return this.ajax.request(`person/${personId}/yearinfo`, { data: { year } })
           .then((result) => result.year_info);

  }
  setupController(controller, model) {
    controller.setProperties(this.modelFor('person'));
    controller.set('yearInfo', model);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
