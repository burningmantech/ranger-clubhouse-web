import Route from '@ember/routing/route';
import MeRouteMixin from 'clubhouse/mixins/route/me';
import DS from 'ember-data';
import RSVP from 'rsvp';

export default class MeScheduleRoute extends Route.extend(MeRouteMixin) {
  queryParams = {
    year: {
      refreshModel: true
    }
  };

  model(params) {
    const person_id = this.session.user.id;
    const year = (params.year || (new Date).getFullYear());
    const scheduleParams = {
      person_id,
      year,
      signups: 1, // *sigh* laravel only take 1 or 0 for booleans as of 5.6
    };

    // Ensure the latest schedules are used.
    this.store.unloadAll('schedule');

    return RSVP.hash({
      slots: this.store.query('schedule', scheduleParams).catch((response) => {
        if (response instanceof DS.NotFoundError) {
          return [];
        }
      }),
      permission: this.ajax.request(`person/${person_id}/schedule/permission`, {data: {
          year
        }}).then((results) => {
        return results.permission;
      }),
      creditsEarned: this.ajax.request(`person/${person_id}/credits`, { data: { year }}).then((result) => result.credits),
      year,
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.set('slots', model.slots);
    controller.set('permission', model.permission);
    controller.set('year', model.year);
    controller.set('creditsEarned', model.creditsEarned);
  }
}
