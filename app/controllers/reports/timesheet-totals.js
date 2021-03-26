import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';

export default class ReportsTimesheetTotalsController extends ClubhouseController {
  queryParams = ['year'];

  @action
  exportToCSV() {
    const rows = [];
    const year = this.year;

    const CSV_COLUMNS = [
      { key: 'callsign', title: 'Callsign' },
      { key: 'status', title: 'Status' },
      { key: 'title', title: 'Position' },
      { key: 'hours', title: `${year} Hours` },
      { key: 'credits', title: `${year} Credits` },
    ];

    this.people.forEach((person) => {
      person.positions.forEach((pos) => {
        rows.push({
          callsign: person.callsign,
          status: person.status,
          title: pos.title,
          hours: (pos.duration / 3600.0).toFixed(2),
          credits: pos.credits.toFixed(2)
        });
      })
    });

    this.house.downloadCsv(`${year}-timesheet-totals.csv`, CSV_COLUMNS, rows);
  }
}
