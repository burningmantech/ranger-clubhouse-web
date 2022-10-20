import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';
import RSVP from 'rsvp';
import ScheduleSlotModel from 'clubhouse/models/schedule-slot';

export default class PersonScheduleRoute extends ClubhouseRoute {
  queryParams = {
    year: {refreshModel: true}
  };

  model(params) {
    const person_id = this.modelFor('person').id;
    const year = requestYear(params);
    const scheduleParams = {
      person_id,
      year,
      credits_earned: 1,
      schedule_summary: 1,
    };

    // Only bother with permissions for the current year
    if (+year === +this.house.currentYear()) {
      scheduleParams.signup_permission = 1;
    }

    return RSVP.hash({
      schedule: this.ajax.request(`person/${person_id}/schedule`, {data: scheduleParams}),
      milestones: this.ajax.request(`person/${person_id}/milestones`).then(({milestones}) => milestones),
      year,
    });
  }

  setupController(controller, model) {
    const {schedule} = model;
    super.setupController(...arguments);
    model.slots = ScheduleSlotModel.hydrate(schedule.slots, schedule.positions);
    model.signedUpSlots = model.slots.filter((slot) => slot.person_assigned);
    model.creditsEarned = schedule.credits_earned;
    model.scheduleSummary = schedule.schedule_summary;
    model.permission = schedule.signup_permission || {};
    controller.set('person', this.modelFor('person'));
    controller.setProperties(model);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
