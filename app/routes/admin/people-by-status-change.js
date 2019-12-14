import Route from '@ember/routing/route';
import { Role } from 'clubhouse/constants/roles';

export default class AdminPeopleByStatusChangeRoute extends Route {
  queryParams = {
    period: { refreshModel: true }
  };

  beforeModel() {
    super.beforeModel(...arguments);
    this.house.roleCheck(Role.ADMIN);
  }

  model({ period }) {
    const date = new Date();
    const month = date.getMonth(),
      day = date.getDay();
    let year = date.getFullYear();

    if (!period) {
      period = 'current-date';
    } else if (period == 'next-event') {
      year++;
    }

    if ((month == 8 && day >= 15) || month > 8) {
      year++;
    }

    this.set('year', year);
    this.set('period', period);
    return this.ajax.request('person/by-status-change', { data: { year } });
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
