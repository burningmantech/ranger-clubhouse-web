import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import RSVP from 'rsvp';
import requestYear from 'clubhouse/utils/request-year';

export default class MeTimesheetRoute extends ClubhouseRoute {
  queryParams = {
    year: {refreshModel: true}
  };

  async model(params) {
    const year = requestYear(params);
    const person_id = this.session.userId;
    const queryParams = {person_id, year};

    // Figure out if timesheet corrections are enabled, and for what year.
    const timesheetInfo = await this.ajax.request('timesheet/info', {
      method: 'GET',
      data: {person_id}
    }).then(({info}) => info);

    this.store.unloadAll('timesheet');

    const data = {
      timesheetInfo,
      year,
      person: this.session.user,
      timesheetSummary: this.ajax.request(`person/${person_id}/timesheet-summary`, {data: {year}}).then(({summary}) => summary),
      timesheets: this.store.query('timesheet', queryParams)
    };


    // When corrections are enabled, pull in timesheet entries, missing requests,
    // and person positions (for missing requests)

    if (timesheetInfo.correction_enabled) {
      this.store.unloadAll('timesheet-missing');

      data.timesheetsMissing = this.store.query('timesheet-missing', queryParams);
      data.positions = this.ajax.request(`person/${person_id}/positions`, {data: {include_mentee: 1}})
        .then(({positions}) => positions);
    } else {
      data.positions = [];
      data.timesheetsMissing = [];
    }

    return RSVP.hash(data);
  }

  setupController(controller, model) {
    controller.setProperties(model);
    controller.finalConfirmation = model.timesheetInfo.timesheet_confirmed;
    controller.confirmedAt = model.timesheetInfo.timesheet_confirmed_at;
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
