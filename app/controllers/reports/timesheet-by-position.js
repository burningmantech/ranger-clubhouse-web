import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';

const CSV_COLUMNS = [
  {title: 'From', key: 'on_duty'},
  {title: 'To', key: 'off_duty'},
  {title: 'Hours', key: 'hours'},
  {title: 'Credits', key: 'credits'},
  {title: 'Callsign', key: 'callsign'},
];

export default class ReportsTimesheetByPositionController extends ClubhouseController {
  queryParams = ['year'];

  @action
  exportToCSV(position) {
    const columns = [...CSV_COLUMNS], rows = [];
    if (this.session.canViewEmail) {
      columns.push({title: 'Email', key: 'email'});
    }

    this._buildExportPosition(position, rows);
    this.house.downloadCsv(`${this.year}-${position.title.replace(/ /g, '-')}.csv`, columns, rows);
  }


  @action
  exportAllToCSV() {
    const columns = [{title: 'Position', key: 'position'}, ...CSV_COLUMNS], rows = [];
    if (this.session.canViewEmail) {
      columns.push({title: 'Email', key: 'email'});
    }

    this.positions.forEach((position) => this._buildExportPosition(position, rows, true));

    this.house.downloadCsv(`${this.year}-all-timesheets.csv`, columns, rows);
  }

  _buildExportPosition(position, rows, includeTitle = false) {
    position.timesheets.forEach((entry) => {
      const row = {
        callsign: entry.person.callsign,
        on_duty: entry.on_duty,
        off_duty: entry.off_duty,
        hours: (entry.duration / 3600.0).toFixed(2),
        credits: entry.credits.toFixed(2),
      };

      if (this.session.canViewEmail) {
        row.email = entry.person.email;
      }

      if (includeTitle) {
        row.position = position.title;
      }
      rows.push(row);
    });
  }
}
