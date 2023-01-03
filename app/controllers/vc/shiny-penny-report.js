import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

const CSV_COLUMNS = [
  {title: 'Callsign', key: 'callsign'},
  {title: 'Status', key: 'status'},
  {title: 'Email', key: 'email'},
  {title: 'First Name', key: 'first_name'},
  {title: 'Last Name', key: 'last_name'},

]
export default class VcShinyPennyReportController extends ClubhouseController {
  queryParams = ['year'];

  @tracked people = [];

  @action
  exportToCSV() {
    this.house.downloadCsv(`${this.year}-shiny-pennies.csv`, CSV_COLUMNS, this.people);
  }
}
