import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';
import ScheduleSlotModel from 'clubhouse/records/schedule-slot';

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

  async model(params) {
    const person_id = this.session.userId;
    const year = requestYear(params);

    const data = {year};
    data.schedule = await this.ajax.request(`person/${person_id}/schedule`, {
      data: {
        person_id,
        year,
        signup_permission: 1,
      }
    });

    return data;
  }

  setupController(controller, model) {
    const user = this.session.user;
    const {schedule} = model;
    model.permission = schedule.signup_permission;

    if (user.isAuditor && schedule.signup_permission.online_course_only) {
      this.toast.error('Sorry, auditors are only allowed to take the online course this year.');
      this.router.transitionTo('me.homepage');
      return;
    }

    model.slots = ScheduleSlotModel.hydrate(schedule.slots, schedule.positions);
    model.signedUpSlots = model.slots.filter((slot) => slot.person_assigned);
    model.creditsEarned = schedule.credits_earned;
    model.scheduleSummary = schedule.schedule_summary;

    controller.setProperties(model);
    controller.set('person', this.modelFor('me'));
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
