import Route from '@ember/routing/route';
import requestYear from 'clubhouse/utils/request-year';

export default class AdminRadioEligibilityRoute extends Route {
  queryParams = {
    year: {refreshModel: true}
  };

  model(params) {
    const year = requestYear(params);
    this.year = year;

    return this.ajax.request('timesheet/radio-eligibility', {data: {year}}).then((results) => results.people);
  }

  setupController(controller, model) {
    controller.set('year', this.year);
    controller.set('year_last', this.year - 1);
    controller.set('year_prev', this.year - 2);
    controller.set('people', model);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
