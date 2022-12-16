import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

export default class ReportsPotentialSwagController extends ClubhouseController {
  @tracked people;
  @tracked signupYear;

  @action
  exportToCSV() {
    const CSV_COLUMNS = [
      {title: 'Callsign', key: 'callsign'},
      {title: 'Status', key: 'status'},
      {title: 'Total Years', key: 'total_years'},
      {title: 'First Year', key: 'first_year'},
      {title: 'Last Worked', key: 'last_worked'},
      {title: `${this.signupYear} Sign-Ups?`, key: 'signed_up', yesno: true},
      {title: `Service Eligible`, key: 'service_eligible'}
    ];

    this.house.downloadCsv(`${this.house.currentYear()}-potential-swag.csv`, CSV_COLUMNS, this.people);
  }
}
