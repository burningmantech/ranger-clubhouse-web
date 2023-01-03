import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {TypeLabels} from 'clubhouse/models/access-document';

const CSV_COLUMNS = [
  {title: 'Callsign', key: 'callsign'},
  {title: 'Status', key: 'status'},
  {title: 'Email', key: 'email'},
  {title: 'Type', key: 'type'},
  {title: 'RAD', key: 'rad_id'},
  {title: 'Expires', key: 'expiry_date'},
  {title: 'Has Sign Up', key: 'has_signup'}
];

export default class VcAccessDocumentsUnclaimedWithSignupsController extends ClubhouseController {
  @action
  exportToCSV() {
    const rows = this.tickets.map((ticket) => {
      const row = {...ticket};
      row.type = TypeLabels[row.type] || row.type;
      row.rad_id = `RAD-${row.access_document_id}`;
      row.has_signup = row.has_signup ? 'Y' : 'N';
      return row;
    });

    this.house.downloadCsv(`${this.house.currentYear()}-unclaimed-tickets.csv`, CSV_COLUMNS, rows);
  }
}
