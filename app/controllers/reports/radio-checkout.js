import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';

const CSV_COLUMNS = [
  {title: 'Callsign', key: 'callsign'},
  {title: 'Barcode', key: 'barcode'},
  {title: 'Duration (Hours)', key: 'duration'},
  {title: 'Checked Out Time', key: 'checked_out'},
  {title: 'Checked Out By', key: 'checkout_person'},
];

const CSV_FULL_COLUMNS = [
  ...CSV_COLUMNS,
  {title: 'Checked In Time', key: 'checked_in'},
  {title: 'Checked In By', key: 'checkin_person'},
  {title: 'Is Event Radio?', key: 'is_event_radio', yesno: true},
  {title: 'Is Event Radio Eligible?', key: 'eligible', yesno: true},
];

export default class ReportsRadioCheckoutController extends ClubhouseController {
  queryParams = ['year', 'include_qualified', 'event_summary'];

  @action
  exportToCSV() {
    const rows = this.radios.map((r) => {
      return {
        callsign: r.callsign,
        barcode: r.barcode,
        duration:  !r.duration ? '0.00' : (+r.duration / 3600.0).toFixed(2),
        checked_out: r.checked_out,
        checkout_person: r.check_out_person ? r.check_out_person.callsign : 'unknown',
        checked_in: r.checked_in ?? '',
        checkin_person: r.check_in_person ? r.check_in_person.callsign : '',
        is_event_radio: r.perm_assign,
        eligible: r.eligible,
      }
    });

    this.house.downloadCsv(`${this.year}-radio-checkout.csv`, (this.event_summary || this.include_eligible) ? CSV_FULL_COLUMNS : CSV_COLUMNS, rows);
  }
}
