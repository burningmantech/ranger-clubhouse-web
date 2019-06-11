import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import requestYear from 'clubhouse/utils/request-year';

export default class PersonTimesheetRoute extends Route {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const year = requestYear(params);
    const person_id = this.modelFor('person').id;
    const queryParams = {
      person_id,
      year,
    };

    this.store.unloadAll('timesheet');
    this.store.unloadAll('timesheet-missing');

    return RSVP.hash({
      timesheets: this.store.query('timesheet', queryParams),
      timesheetInfo: this.ajax.request('timesheet/info', {
        method: 'GET',
        data: { person_id }
      }).then((result) => result.info),
      timesheetMissing: this.store.query('timesheet-missing', queryParams),
      year: year,
      positions: this.ajax.request(`person/${person_id}/positions`,{
        data: { include_training: 1, year }
      }).then((results) => results.positions),
      timesheetSummary: this.ajax.request(`person/${person_id}/schedule/summary`, { data: { year }}).then((result) => result.summary),
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.setProperties(model);
    controller.set('person', this.modelFor('person'));
    controller.set('canCorrectThisYear', (model.timesheetInfo.correction_year == model.year));
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
