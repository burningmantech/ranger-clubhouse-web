import Route from '@ember/routing/route';
import MeRouteMixin from 'clubhouse/mixins/route/me';
import requestYear from 'clubhouse/utils/request-year';
import RSVP from 'rsvp';

export default class MeScheduleRoute extends Route.extend(MeRouteMixin) {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const person_id = this.session.userId;
    const year = requestYear(params);

    this.store.unloadAll('schedule');

    return RSVP.hash({
      signedUpSlots: this.store.query('schedule', { person_id, year }).then((result) => result.toArray()),
      slots: this.store.query('schedule', { person_id, year, shifts_available: 1}),
      scheduleSummary: this.ajax.request(`person/${person_id}/schedule/summary`, { data: { year }}).then((result) => result.summary),
      permission: this.ajax.request(`person/${person_id}/schedule/permission`, {data: { year }})
                  .then((results) => results.permission ),
      creditsEarned: this.ajax.request(`person/${person_id}/credits`, { data: { year }})
                  .then((result) => result.credits),
      year,
    });
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
