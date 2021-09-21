import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';

const CSV_COLUMNS = [
  {title: 'Callsign', key: 'callsign'},
  {title: 'Name', key: 'name'},
  {title: 'Status', key: 'status'},
  {title: 'Email', key: 'email'},
  {title: 'First Year Worked', key: 'first_year'},
  {title: 'Last Year Worked', key: 'last_year'},
  {title: 'Total Years', key: 'total_years'}
];

export default class AdminRangerRetentionController extends ClubhouseController {
  @action
  exportToCsv() {
    this.people.forEach((person) => person.name = `${person.first_name} ${person.last_name}`);
    this.house.downloadCsv(`ranger-retention-${this.end_year}.csv`, CSV_COLUMNS, this.people);
  }
}
