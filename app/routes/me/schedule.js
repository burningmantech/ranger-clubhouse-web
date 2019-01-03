import Route from '@ember/routing/route';
import MeRouteMixin from 'clubhouse/mixins/route/me';
import requestYear from 'clubhouse/utils/request-year';
import RSVP from 'rsvp';

export default class MeScheduleRoute extends Route.extend(MeRouteMixin) {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const person_id = this.session.user.id;
    const year = requestYear(params);
    const scheduleParams = {
      person_id,
      year,
      signups: 1, // *sigh* laravel only take 1 or 0 for booleans as of 5.6
    };

    return RSVP.hash({
      slots: this.store.query('schedule', scheduleParams),
      permission: this.ajax.request(`person/${person_id}/schedule/permission`, {data: { year }})
                  .then((results) => results.permission ),
      creditsEarned: this.ajax.request(`person/${person_id}/credits`, { data: { year }})
                  .then((result) => result.credits),
      year,
    });
  }
}
