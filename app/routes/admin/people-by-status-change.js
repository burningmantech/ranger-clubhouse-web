import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN} from 'clubhouse/constants/roles';

export default class AdminPeopleByStatusChangeRoute extends ClubhouseRoute {
  roleRequired = ADMIN;

  queryParams = {
    period: {refreshModel: true}
  };

  model({period}) {
    const date = new Date();

    let year = date.getFullYear();

    if (!period) {
      period = 'current-date';
    } else if (period === 'next-event') {
      year++;
    }

    this.year = year;
    this.period = period;
    return this.ajax.request('person/by-status-change', {data: {year}});
  }

  setupController(controller, model) {
    controller.setProperties(model);
    controller.set('year', this.year);
    controller.set('period', this.period);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('period', null);
    }
  }
}
