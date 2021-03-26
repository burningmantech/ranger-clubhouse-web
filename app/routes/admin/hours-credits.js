import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import { ADMIN } from 'clubhouse/constants/roles';
import requestYear from 'clubhouse/utils/request-year';

export default class AdminHoursCreditsRoute extends ClubhouseRoute {
  roleRequired = ADMIN;

  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const year = requestYear(params);
    this.year = year;
    return this.ajax.request('timesheet/hours-credits', { data: { year }});
  }

  setupController(controller, model) {
    controller.set('year', this.year);
    controller.set('people', model.people);
    controller.set('eventStart', model.event_start);
    controller.set('eventEnd', model.event_end);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
