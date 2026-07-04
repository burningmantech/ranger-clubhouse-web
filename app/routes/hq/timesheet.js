import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class HqTimesheetRoute extends ClubhouseRoute {
  async model() {
    const person_id = this.modelFor('hq').person.id;
    const year = this.session.currentYear();

    this.store.unloadAll('timesheet-missing');

    const [timesheetInfo, timesheetsMissing, timesheets] = await Promise.all([
      this.ajax.request('timesheet/info', {
        method: 'GET',
        data: { person_id }
      }),
      this.store.query('timesheet-missing', { person_id, year }),
      this.store.query('timesheet', { person_id, year }),
    ]);

    return {
      timesheetInfo: timesheetInfo.info,
      timesheetsMissing,
      timesheets,
    };
  }

  setupController(controller, model) {
    super.setupController(...arguments);

    controller.set('person', this.modelFor('hq').person);
    controller.setProperties(model);
    controller.set('year', this.session.currentYear());
  }
}
