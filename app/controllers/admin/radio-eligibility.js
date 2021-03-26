import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';

export default class AdminRadioEligibilityController extends ClubhouseController {
  queryParams = [ 'year' ];

  @action
  exportToCsv() {
    const CSV_COLUMNS = [
      { title: 'Callsign', key: 'callsign' },
      { title: `${this.year_last} Hours`, key: 'hours_last_year' },
      { title: `${this.year_prev} Hours`, key: 'hours_prev_year' },
      { title: `Radio Hours`, key: 'radio_hours' },
      { title: 'Shift Lead', key: 'shift_lead' },
      { title: `${this.year} Signed Up`, key: 'signed_up' }
    ];

    this.house.downloadCsv(`${this.year}-radio-eligibility.csv`, CSV_COLUMNS, this.people);
  }
}
