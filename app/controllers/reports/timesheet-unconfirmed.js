import Controller from '@ember/controller';
import { action } from '@ember/object';

const CSV_COLUMNS = [
  'callsign', 'first_name', 'last_name', 'email', 'home_phone', 'unverified_count'
];

export default class ReportsTimesheetUnconfirmedController extends Controller {
  queryParmas = ['year'];

  @action
  changeYear(year) {
    this.set('year', year);
  }

  @action downloadCsv() {
    this.house.downloadCsv('timesheet-unconfirmed.csv', CSV_COLUMNS, this.unconfirmed_people);
  }
}
