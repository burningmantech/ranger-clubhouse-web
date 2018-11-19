import Route from '@ember/routing/route';
import requestYear from 'clubhouse/utils/request-year';
import RSVP from 'rsvp';

export default class PersonScheduleRoute extends Route {
  queryParams = {
    year: {
      refreshModel: true
    }
  };

  model(params) {
    const person_id = this.modelFor('person').person.id;
    const year = requestYear(params);
    const scheduleParams = {
      person_id,
      year,
      signups: 1, // *sigh* laravel only take 1 or 0 for booleans as of 5.6
    };

    const records = {
      slots: this.store.query('schedule', scheduleParams),
      creditsEarned: this.ajax.request(`person/${person_id}/credits`, {data: { year }})
                  .then((result) => result.credits),
      year,
    }

    // Only bother with permissions for the current year
    if (year == (new Date()).getFullYear()) {
      records.permission = this.ajax.request(`person/${person_id}/schedule/permission`, {data: { year }})
                  .then((results) => results.permission );
    } else {
      records.permission = {};
    }

    return RSVP.hash(records);
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.setProperties(this.modelFor('person'));
    controller.setProperties(model);
  }
}
