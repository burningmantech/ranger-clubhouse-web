import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';

export default class AdminRadioEligibilityRoute extends ClubhouseRoute {
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

    let year_last, year_prev;
    switch (this.year) {
      case 2022:
        year_last = 2019;
        year_prev = 2018;
        break;
      case 2023:
        year_last = 2022;
        year_prev = 2019;
        break;
      default:
        year_last = this.year - 1;
        year_prev = this.year - 2;
        break;
    }
    controller.set('year_last', year_last);
    controller.set('year_prev', year_prev);
    controller.set('people', model);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
