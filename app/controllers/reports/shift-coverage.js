import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { tracked } from '@glimmer/tracking';
import _ from 'lodash';
import moment from 'moment';

export default class ReportsShiftCoveragController extends ClubhouseController {
  queryParams = [ 'year', 'type' ];

  @tracked dayFilter;

  typeOptions = [
    [ 'Burn Perimeter', 'perimeter' ],
    [ 'Command', 'command' ],
    [ 'Echelon', 'echelon' ],
    [ 'Gerlach Patrol', 'gerlach-patrol' ],
    [ 'Green Dot', 'gd' ],
    [ 'HQ Window', 'hq' ],
    [ 'Intercept', 'intercept' ],
    [ 'Mentors', 'mentor' ],
    [ 'Pre-event', 'pre-event' ],
    [ 'RSCI Mentor/Mentee', 'rsci-mentor' ],
  ];

  get dayGroups() {
    const dayFilter = this.dayFilter;
    const groups = _.map(_.groupBy(this.periods, 'date'), (periods, date) => {
      return { date, periods }
    });

    if (dayFilter === 'all') {
      return groups;
    }

    return groups.filter((g) => g.date === dayFilter);
  }

  get dayOptions() {
    const days = _.uniqBy(this.periods, 'date');
    const options = days.map((p) => [ moment(p.date).format('ddd M/DD'), p.date ]);
    options.unshift([ 'All', 'all' ]);
    return options;
  }
}
