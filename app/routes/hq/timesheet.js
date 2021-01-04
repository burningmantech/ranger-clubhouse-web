import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class HqTimesheetRoute extends Route {
  model() {
    const person_id = this.modelFor('hq').person.id;
    const year = this.house.currentYear();

    this.store.unloadAll('timesheet-missing');

    return RSVP.hash({
      timesheetInfo: this.ajax.request('timesheet/info', {
        method: 'GET',
        data: { person_id }
      }).then((result) => result.info),
      timesheetsMissing: this.store.query('timesheet-missing', { person_id, year }),
      correctionPositions: this.ajax.request(`person/${person_id}/positions`,{ data: { include_mentee: 1 } }).then((results) => results.positions),
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);

    controller.setProperties(this.modelFor('hq'));
    controller.setProperties(model);
    controller.set('year', this.house.currentYear());
  }
}
