import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class HqTimesheetRoute extends ClubhouseRoute {
  async model() {
    const person_id = this.modelFor('hq').person.id;
    const year = this.session.currentYear();

    this.store.unloadAll('timesheet-missing');

    return {
      timesheetInfo: (await this.ajax.request('timesheet/info', {
        method: 'GET',
        data: { person_id }
      })).info,
      timesheetsMissing: await this.store.query('timesheet-missing', { person_id, year }),
      correctionPositions: (await this.ajax.request(`person/${person_id}/positions`,{ data: { include_past_grants: 1 } })).positions,
      timesheetSummary: (await this.ajax.request(`person/${person_id}/timesheet-summary`, { data: { year }})).summary,
      timesheets: await this.store.query('timesheet', { person_id, year }),
    };
  }

  setupController(controller, model) {
    super.setupController(...arguments);

    controller.setProperties(this.modelFor('hq'));
    controller.setProperties(model);
    controller.set('year', this.session.currentYear());
  }
}
