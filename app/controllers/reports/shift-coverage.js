import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { cached, tracked } from '@glimmer/tracking';

export default class ReportsShiftCoveragController extends ClubhouseController {
  queryParams = [ 'year', 'type' ];

  @tracked dayFilter = null;
  @tracked dayPeriods = null;

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
    [ 'O.N.E.', 'one']
  ];

  @cached
  get dayGroups() {
    const {dayFilter, dayPeriods} = this;

    if (dayFilter === 'all') {
      return dayPeriods;
    }

    return dayPeriods.filter((g) => g.monthDay === dayFilter);
  }
}
