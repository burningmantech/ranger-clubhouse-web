import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';
import RSVP from 'rsvp';
import ScheduleSlotModel from 'clubhouse/models/schedule-slot';

export default class MeScheduleRoute extends ClubhouseRoute {
  queryParams = {
    year: {refreshModel: true}
  };

  beforeModel() {
    const user = this.session.user;
    if (user.isPastProspective || user.isBonked) {
      this.toast.error('You are not permitted to sign up for trainings or shifts at this time.');
      this.router.transitionTo('me.homepage');
    } else {
      super.beforeModel(...arguments);
    }
  }

  model(params) {
    const person_id = this.session.userId;
    const year = requestYear(params);

    return RSVP.hash({
      schedule: this.ajax.request(`person/${person_id}/schedule`, {
        data: {
          person_id,
          year,
          credits_earned: 1,
          schedule_summary: 1,
          signup_permission: 1
        }
      }),
      year
    });
  }

  setupController(controller, model) {
    const user = this.session.user;
    const {schedule} = model;
    model.permission = schedule.signup_permission;

    if (user.isAuditor && schedule.signup_permission.online_training_only) {
      this.toast.error('Sorry, auditors are only allowed to take Online Training this year.');
      this.router.transitionTo('me.homepage');
      return;
    }

    if ((user.isAuditor || user.isProspective || user.isAlpha) && !schedule.signup_permission.all_signups_allowed) {
      this.toast.error('You need to complete one or more items in the checklist before being allowed to sign up.');
      this.router.transitionTo('me.homepage');
      return;
    }

    model.slots = ScheduleSlotModel.hydrate(schedule.slots, schedule.positions);
    model.signedUpSlots = model.slots.filter((slot) => slot.person_assigned);
    model.creditsEarned = schedule.credits_earned;
    model.scheduleSummary = schedule.schedule_summary;
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
