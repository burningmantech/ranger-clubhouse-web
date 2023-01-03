import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

export default class AdminRadioEligibilityController extends ClubhouseController {
  queryParams = ['year'];

  @tracked people;
  @tracked year_1;
  @tracked year_2;
  @tracked year_3;
  @tracked shift_lead_positions;

  @action
  exportToCsv() {
    const CSV_COLUMNS = [
      {title: 'Callsign', key: 'callsign'},
      {title: `${this.year_1} Hours`, key: 'year_1'},
      {title: `${this.year_2} Hours`, key: 'year_2'},
      {title: `${this.year_3} Hours`, key: 'year_3'},
      {title: `Radio Hours`, key: 'radio_hours'},
      {title: 'Shift Lead', key: 'shift_lead', yesno: true},
      {title: `${this.year} Signed Up`, key: 'signed_up', yesno: true}
    ];

    this.house.downloadCsv(`${this.year}-radio-eligibility.csv`, CSV_COLUMNS, this.people);
  }
}
