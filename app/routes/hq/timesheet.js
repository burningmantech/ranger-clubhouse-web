import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import RSVP from 'rsvp';

export default class HqTimesheetRoute extends ClubhouseRoute {
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
      correctionPositions: this.ajax.request(`person/${person_id}/positions`,{ data: { include_past_grants: 1 } }).then((results) => results.positions),
      timesheetSummary: this.ajax.request(`person/${person_id}/timesheet-summary`, { data: { year }})
        .then((result) => result.summary),
      timesheets: this.store.query('timesheet', { person_id, year }),
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);

    controller.setProperties(this.modelFor('hq'));
    controller.setProperties(model);
    controller.set('year', this.house.currentYear());
  }
}
