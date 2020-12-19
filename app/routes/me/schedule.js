import Route from '@ember/routing/route';
import requestYear from 'clubhouse/utils/request-year';
import RSVP from 'rsvp';

export default class MeScheduleRoute extends Route {
  queryParams = {
    year: { refreshModel: true }
  };

  beforeModel() {
    const user = this.session.user;
    if (user.isPastProspective || user.isBonked) {
      this.toast.error('You are not permitted to sign up for trainings or shifts at this time.');
      this.transitionTo('me.homepage');
    }
  }

  model(params) {
    const person_id = this.session.userId;
    const year = requestYear(params);

    this.store.unloadAll('schedule');

    return RSVP.hash({
      signedUpSlots: this.store.query('schedule', { person_id, year }).then((result) => result.toArray()),
      slots: this.store.query('schedule', { person_id, year, shifts_available: 1 }),
      scheduleSummary: this.ajax.request(`person/${person_id}/schedule/summary`, { data: { year } }).then((result) => result.summary),
      permission: this.ajax.request(`person/${person_id}/schedule/permission`, { data: { year } })
        .then((results) => results.permission),
      creditsEarned: this.ajax.request(`person/${person_id}/credits`, { data: { year } })
        .then((result) => result.credits),
      year
    });
  }

  setupController(controller, model) {
    const user = this.session.user;

    if ((user.isAuditor || user.isProspective || user.isAlpha) && !model.permission.all_signups_allowed) {
      this.toast.error('You need to complete one or more items in the checklist before being allowed to sign up.');
      this.transitionTo('me.homepage');
    }
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
