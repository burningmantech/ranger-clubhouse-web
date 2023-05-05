import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import RSVP from 'rsvp';
import ScheduleSlotModel from 'clubhouse/models/schedule-slot';

export default class HqScheduleRoute extends ClubhouseRoute {
  model() {
    const person_id = this.modelFor('hq').person.id;
    const year = this.house.currentYear();

    this.store.unloadAll('timesheet');

    return RSVP.hash({
      schedule: this.ajax.request(`person/${person_id}/schedule`,
        {data: {person_id, year, signup_permission: 1}}),
    });
  }

  setupController(controller, model) {
    const hq = this.modelFor('hq');
    const {schedule} = model;

    model.slots = ScheduleSlotModel.hydrate(schedule.slots, schedule.positions);
    model.signedUpSlots = model.slots.filter((slot) => slot.person_assigned);
    model.permission = schedule.signup_permission;
    model.scheduleSummary = schedule.schedule_summary;
    controller.setProperties(model);
    controller.set('person', hq.person);
    controller.set('year', this.house.currentYear());
  }
}
