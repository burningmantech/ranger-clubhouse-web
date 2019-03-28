import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class HqTimesheetRoute extends Route {
  model() {
    const person_id = this.modelFor('hq').person.id;
    const year = this.house.currentYear();

    return RSVP.hash({
      timesheetInfo: this.ajax.request('timesheet/info', {
        method: 'GET',
        data: { person_id }
      }).then((result) => result.info),
      timesheetsMissing: this.store.query('timesheet-missing', { person_id, year }).then((result) => result.toArray()),
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);

    controller.setProperties(this.modelFor('hq'));
    controller.setProperties(model);
    controller.set('year', this.house.currentYear());
  }
}
