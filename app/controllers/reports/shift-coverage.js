import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {cached, tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import {isEmpty} from '@ember/utils';
import dayjs from 'dayjs';

export default class ReportsShiftCoveragController extends ClubhouseController {
  queryParams = ['year', 'type'];

  @tracked dayFilter = null;
  @tracked dayPeriods = null;

  typeOptions = [
    ['Burn Perimeter', 'perimeter'],
    ['Command', 'command'],
    ['Echelon', 'echelon'],
    ['Gerlach Patrol', 'gerlach-patrol'],
    ['Green Dot', 'gd'],
    ['HQ Window', 'hq'],
    ['Intercept', 'intercept'],
    ['Mentors', 'mentor'],
    ['Pre-Event', 'pre-event'],
    ['Post-Event', 'post-event'],
    ['RSCI Mentor/Mentee', 'rsci-mentor'],
    ['Troubleshooter', 'troubleshooter'],
  ];

  @cached
  get dayGroups() {
    const {dayFilter, dayPeriods} = this;

    if (dayFilter === 'all') {
      return dayPeriods;
    }

    return dayPeriods.filter((g) => g.monthDay === dayFilter);
  }

  @action
  exportToCSV() {
    const columns = [
      {title: 'Period Start', key: 'period_start'},
      {title: 'Period End', key: 'period_ends'}
    ];

    this.columns.forEach((c) => columns.push({title: c.short_title, key: c.position_id}));

    const rows = [];
    this.periods.forEach((period) => {
      const row = {period_start: period.begins, period_ends: period.ends};
      period.positions.forEach((pos) => {
        if (pos.type === 'count') {
          row[pos.position_id] = pos.shifts;
        } else {
          const lines = [];
          pos.shifts.forEach((s) => {
            if (pos.shifts.length > 1) {
              lines.push(`${dayjs(s.begins).format('HH:mm')} - ${dayjs(s.ends).format('HH:mm')}`);
            }
            s.people.forEach((person) => lines.push(!isEmpty(person.parenthetical) ? `${person.callsign} (${person.parenthetical})` : person.callsign));
          })
          row[pos.position_id] = lines.join("\n");
        }
      })
      rows.push(row);
    })

    this.house.downloadCsv(`${this.year}-${this.type}.csv`, columns, rows);
  }
}
