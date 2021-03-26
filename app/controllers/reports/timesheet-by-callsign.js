import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';

export default class ReportsTimesheetByCallsignController extends ClubhouseController {
  queryParams = ['year'];

  @action
  scrollToCallsign(id) {
    this.house.scrollToElement(`#person-${id}`, false);
  }

  get letterOptions() {
    let letters = {};
    this.people.forEach((person) => {
      const letter = person.callsign.charAt(0).toUpperCase();
      if (!letters[letter]) {
        letters[letter] = person.id;
      }
    });

    return Object.keys(letters).sort().map((letter) => {
      return {id: letters[letter], letter};
    });
  }

  @action
  exportToCSV() {
    const CSV_COLUMNS = [
      {title: 'Callsign', key: 'callsign'},
      {title: 'Status', key: 'status'},
      {title: 'From', key: 'on_duty'},
      {title: 'To', key: 'off_duty'},
      {title: 'Hours', key: 'hours'},
      {title: 'Credits', key: 'credits'},
      {title: 'Position', key: 'position'},
      {title: 'Count Hours', key: 'count_hours'}
    ];

    const rows = [];

    this.people.forEach((person) => {
      person.timesheet.forEach((entry) => {
        rows.push({
          'callsign': person.callsign,
          'status': person.status,
          'on_duty': entry.on_duty,
          'off_duty': entry.off_duty,
          'hours': (entry.duration / 3600.0).toFixed(2),
          'credits': entry.credits.toFixed(2),
          'position': entry.position.title,
          'count_hours': entry.position.count_hours ? 'Y' : 'N'
        });
      });
    });

    this.house.downloadCsv(`${this.year}-timesheet-by-callsign.csv`, CSV_COLUMNS, rows);
  }
}
