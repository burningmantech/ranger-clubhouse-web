import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class HqShiftRoute extends Route {
  model() {
    const person_id = this.modelFor('hq').person.id;
    const year = this.house.currentYear();

    return RSVP.hash({
      imminentSlots: this.ajax.request(`person/${person_id}/schedule/imminent`)
        .then((result) => result.slots),
      scheduleRecommendations: this.ajax.request(`person/${person_id}/schedule/recommendations`),
      timesheetSummary: this.ajax.request(`person/${person_id}/timesheet-summary`, { data: { year }})
        .then((result) => result.summary),
      timesheets: this.store.query('timesheet', { person_id, year }),
      expected: this.ajax.request(`person/${person_id}/schedule/expected`),
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.setProperties(model);
    controller.setProperties(this.modelFor('hq'));
    controller.set('showCorrectionForm', false);
    controller.set('showSiteLeaveDialog', false);
    controller.set('unverifiedTimesheets', controller.timesheets.filter((ts) => ts.isUnverified));
  }
}
