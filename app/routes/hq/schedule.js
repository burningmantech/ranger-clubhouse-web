import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import RSVP from 'rsvp';
import ScheduleModel from 'clubhouse/models/schedule';

export default class HqScheduleRoute extends ClubhouseRoute {
  model() {
    const person_id = this.modelFor('hq').person.id;
    const year = this.house.currentYear();

    this.store.unloadAll('schedule');
    this.store.unloadAll('timesheet');

    return RSVP.hash({
      slots: this.store.query('schedule',  { person_id, year, schedule_summary: 1, signup_permission: 1 }),
      timesheets: this.store.query('timesheet', { person_id, year }),
    });
  }

  setupController(controller, model) {
    const hq = this.modelFor('hq');
    super.setupController(...arguments);

    const meta = model.slots.meta;
    ScheduleModel.hydratePositions(model.slots);
    model.signedUpSlots = model.slots.filter((slot) => slot.person_assigned);
    model.permission = meta.signup_permission;
    model.scheduleSummary = meta.schedule_summary;
    controller.setProperties(model);
    controller.set('person', hq.person);
    controller.set('year', this.house.currentYear());
  }
}
