import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';

export default class ReportsTimesheetByPositionController extends ClubhouseController {
  queryParams = ['year'];

  @action
  exportToCSV(position) {
    const CSV_COLUMNS = [
      {title: 'From', key: 'on_duty'},
      {title: 'To', key: 'off_duty'},
      {title: 'Hours', key: 'hours'},
      {title: 'Callsign', key: 'callsign'},
    ];

    if (this.session.canViewEmail) {
      CSV_COLUMNS.push({title: 'Email', key: 'email'});
    }

    const rows = position.timesheets.map((entry) => {
      const row = {
        callsign: entry.person.callsign,
        on_duty: entry.on_duty,
        off_duty: entry.off_duty,
        hours: (entry.duration / 3600.0).toFixed(2),
      };

      if (this.session.canViewEmail) {
        row.email = entry.person.email;
      }

      return row;
    });

    this.house.downloadCsv(`${this.year}-${position.title.replace(/ /g, '-')}.csv`, CSV_COLUMNS, rows);
  }
}
