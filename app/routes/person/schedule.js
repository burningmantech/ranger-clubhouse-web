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
    const person_id = this.modelFor('person').id;
    const year = requestYear(params);
    const scheduleParams = {
      person_id,
      year,
      shifts_available: 1,
    };

    this.store.unloadAll('schedule');

    const records = {
      signedUpSlots: this.store.query('schedule', { person_id, year }).then((result) => result.toArray()),
      slots: this.store.query('schedule', scheduleParams),
      scheduleSummary: this.ajax.request(`person/${person_id}/schedule/summary`, { data: { year }}).then((result) => result.summary),
      creditsEarned: this.ajax.request(`person/${person_id}/credits`, {data: { year }})
                  .then((result) => result.credits),
      year,
    }

    // Only bother with permissions for the current year
    if (year == this.house.currentYear()) {
      records.permission = this.ajax.request(`person/${person_id}/schedule/permission`, {data: { year }})
                  .then((results) => results.permission );
    } else {
      records.permission = {};
    }

    return RSVP.hash(records);
  }

  setupController(controller, model) {
    super.setupController(...arguments);
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
