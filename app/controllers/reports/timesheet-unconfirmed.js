import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';

const CSV_COLUMNS = [
  'callsign', 'first_name', 'last_name', 'email', 'home_phone', 'unverified_count'
];

export default class ReportsTimesheetUnconfirmedController extends ClubhouseController {
  queryParmas = ['year'];

  @action downloadCsv() {
    this.house.downloadCsv(`${this.year}-timesheet-unconfirmed.csv`, CSV_COLUMNS, this.unconfirmed_people);
  }
}
