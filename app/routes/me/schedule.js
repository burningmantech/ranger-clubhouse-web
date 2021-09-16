import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';
import RSVP from 'rsvp';
import ScheduleModel from 'clubhouse/models/schedule';

export default class MeScheduleRoute extends ClubhouseRoute {
  queryParams = {
    year: {refreshModel: true}
  };

  beforeModel() {
    const user = this.session.user;
    if (user.isPastProspective || user.isBonked) {
      this.toast.error('You are not permitted to sign up for trainings or shifts at this time.');
      this.transitionTo('me.homepage');
    } else {
      super.beforeModel(...arguments);
    }
  }

  model(params) {
    const person_id = this.session.userId;
    const year = requestYear(params);

    this.store.unloadAll('schedule');

    return RSVP.hash({
      slots: this.store.query('schedule', {
        person_id,
        year,
        credits_earned: 1,
        schedule_summary: 1,
        signup_permission: 1
      }),
      year
    });
  }

  setupController(controller, model) {
    const user = this.session.user;

    const meta = model.slots.meta;
    model.permission = meta.signup_permission;

    if (user.isAuditor && model.permission.online_training_only) {
      this.toast.error('Sorry, auditors are only allowed to take Online Training this year.');
      this.transitionTo('me.homepage');
      return;
    }

    if ((user.isAuditor || user.isProspective || user.isAlpha) && !model.permission.all_signups_allowed) {
      this.toast.error('You need to complete one or more items in the checklist before being allowed to sign up.');
      this.transitionTo('me.homepage');
      return;
    }

    ScheduleModel.hydratePositions(model.slots);
    model.signedUpSlots = model.slots.filter((slot) => slot.person_assigned);
    model.creditsEarned = meta.credits_earned;
    model.scheduleSummary = meta.schedule_summary;
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
