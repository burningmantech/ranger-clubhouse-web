import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import RSVP from 'rsvp';

export default class HqScheduleRoute extends ClubhouseRoute {
  model() {
    const person_id = this.modelFor('hq').person.id;
    const year = this.house.currentYear();

    this.store.unloadAll('schedule');
    this.store.unloadAll('timesheet');

    return RSVP.hash({
      signedUpSlots: this.store.query('schedule', { person_id, year }).then((result) => result.toArray()),
      slots: this.store.query('schedule',  { person_id, year, shifts_available: 1 }),
      scheduleSummary: this.ajax.request(`person/${person_id}/schedule/summary`, { data: { year }}).then((result) => result.summary),
      permission: this.ajax.request(`person/${person_id}/schedule/permission`, {data: { year }})
                  .then((results) => results.permission ),
      timesheets: this.store.query('timesheet', { person_id, year }),
    });
  }

  setupController(controller, model) {
    const hq = this.modelFor('hq');
    super.setupController(...arguments);

    controller.setProperties(model);
    controller.set('person', hq.person);
    controller.set('year', this.house.currentYear());
  }
}
