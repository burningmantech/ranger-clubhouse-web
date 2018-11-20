import Route from '@ember/routing/route';
import requestYear from 'clubhouse/utils/request-year';

export default class PersonTimesheetLogRoute extends Route {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const person_id = this.modelFor('person').person.id;
    const year = requestYear(params);

    return this.ajax.request(`timesheet/log`, {
      data: { person_id, year }
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);

    controller.set('logs', model.logs);
    controller.set('otherLogs', model.other_logs);
    controller.setProperties(this.modelFor('person'));
  }
}
