import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';
import _ from 'lodash';
import dayjs from 'dayjs';

export default class ReportsShiftCoverageRoute extends ClubhouseRoute {
  queryParams = {
    year: {refreshModel: true},
    type: {refreshModel: true},
  };

  model(params) {
    const year = requestYear(params);
    const type = params.type || 'command';

    this.year = year;
    this.type = type;
    return this.ajax.request('slot/shift-coverage-report', {data: {year, type}});
  }

  setupController(controller, model) {
    const {periods, columns} = model
    controller.set('periods', periods);
    controller.set('columns', columns);
    controller.set('year', this.year);
    controller.set('type', this.type);
    controller.set('dayFilter', 'all');

    periods.forEach((period) => period.monthDay = dayjs(period.date).format('MMDD'));

    controller.set('dayPeriods', _.map(_.groupBy(periods, 'monthDay'), (periods, monthDay) => ({monthDay, periods})));

    const options = _.uniqBy(periods, 'monthDay')
      .map((p) => ({id: p.monthDay, title: dayjs(p.date).format('ddd MMM D')}));

    options.unshift({id: 'all', title: 'All'});

    controller.set('dayOptions', options);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
      controller.set('type', null);
    }
  }
}
