import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import _ from 'lodash';
import moment from 'moment';

export default class ReportsHqForecastController extends ClubhouseController {
  queryParams = [ 'year', 'interval' ];

  @tracked dayFilter = 'all';
  @tracked staffFilter = 'all';

  intervalOptions = [
    ['15 mins', 15],
    ['30 mins', 30],
    ['1 hour', 60],
    ['3 hours', 180],
    ['6 hours', 360]
  ];

  staffOptions = [
    [ 'All', 'all' ],
    [ 'No Staffing', 'none' ]
  ];

  get viewVisits() {
    const dayFilter = this.dayFilter, staffFilter = this.staffFilter;
    let visits = this.visits;

    if (dayFilter !== 'all') {
      visits = visits.filter((v) => moment(v.period).isSame(dayFilter, 'day'));
    }

    if (staffFilter !== 'all') {
      visits = visits.filter((v) => (!v.windows && !v.shorts && !v.leads));
    }

    return visits;
  }

  get dayOptions() {
    const days = _.uniq(this.visits.map((v) => moment(v.period).format('YYYY-MM-DD'))).sort();
    const options = days.map((d) => [ moment(d).format('ddd MMM DD'), d ]);

    options.unshift([ 'All', 'all' ]);

    return options;
  }

  @action
  exportToCsv() {
    const CSV_COLUMNS = [
      { title: `Time (${this.interval} min interval)`, key: 'period' },
      { title: 'Check Ins', key: 'checkin' },
      { title: 'Check Outs', key: 'checkout' },
      { title: 'Window', key: 'windows' },
      { title: 'Runners', key: 'runners' },
      { title: 'Shorts', key: 'shorts' },
      { title: 'Leads', key: 'leads' }
    ];

    this.house.downloadCsv(`${this.year}-hq-forecast.csv`, CSV_COLUMNS, this.visits);
  }
}
