import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

const CSV_COLUMNS = [
  {title: 'Callsign', key: 'callsign'},
  {title: 'Status', key: 'status'},
  {title: 'From', key: 'on_duty'},
  {title: 'To', key: 'off_duty'},
  {title: 'Hours', key: 'hours'},
  {title: 'Credits', key: 'credits'},
  {title: 'Position', key: 'position'},
  {title: 'Count Hours', key: 'count_hours'},
  {title: 'Shift Begins', key: 'shift_begins'},
  {title: 'Shift Duration', key: 'shift_duration'},
  {title: 'Shift Description', key: 'shift_description'},
];

export default class ReportsTimesheetByCallsignController extends ClubhouseController {
  queryParams = ['year'];

  @tracked people;
  @tracked status;

  get callsignScrollItems() {
    return this.people.map((p) => ({
      id: `person-${p.id}`,
      title: p.callsign,
    }))
  }

  @action
  exportAllToCSV() {
    const rows = [];
    this.people.forEach((person) => this._buildTimesheetExport(rows, person));
    this.house.downloadCsv(`${this.year}-timesheet-by-callsign.csv`, CSV_COLUMNS, rows);
  }

  @action
  exportPersonToCSV(person) {
    const rows = [];
    this._buildTimesheetExport(rows, person);
    this.house.downloadCsv(`${this.year}-${person.callsign.replace(/ /g, '-')}-timesheet.csv`, CSV_COLUMNS, rows);
  }

  @action
  _buildTimesheetExport(rows, person) {
    person.timesheet.forEach((entry) => {
      rows.push({
        'callsign': person.callsign,
        'status': person.status,
        'on_duty': entry.on_duty,
        'off_duty': entry.off_duty,
        'hours': (entry.duration / 3600.0).toFixed(2),
        'credits': entry.credits.toFixed(2),
        'position': entry.position.title,
        'count_hours': entry.position.count_hours ? 'Y' : 'N',
        'shift_begins': entry.slot?.begins,
        'shift_duration': entry.slot ? (entry.slot.duration / 3600.0).toFixed(2) : '',
        'shift_description': entry.slot?.description,
      });
    });
  }
}
