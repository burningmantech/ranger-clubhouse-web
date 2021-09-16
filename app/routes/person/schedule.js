import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';
import RSVP from 'rsvp';
import ScheduleModel from 'clubhouse/models/schedule';

export default class PersonScheduleRoute extends ClubhouseRoute {
  queryParams = {
    year: {
      refreshModel: true
    }
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
    if (year == this.house.currentYear()) {
      scheduleParams.signup_permission = 1;
    }

    this.store.unloadAll('schedule');

    return RSVP.hash({
      slots: this.store.query('schedule', scheduleParams),
      year,
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    ScheduleModel.hydratePositions(model.slots);
    model.signedUpSlots = model.slots.filter((slot) => slot.person_assigned);
    const meta = model.slots.meta;
    model.creditsEarned = meta.credits_earned;
    model.scheduleSummary = meta.schedule_summary;
    model.permission = meta.signup_permission || {};
    controller.set('person', this.modelFor('person'));
    controller.setProperties(model);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      this.store.unloadAll('schedule');
      controller.set('year', null);
    }
  }
}
