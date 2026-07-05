import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {ticketTypeHuman} from 'clubhouse/helpers/ticket-type-human';

const CSV_COLUMNS = [
  {title: 'Callsign', key: 'callsign'},
  {title: 'Status', key: 'status'},
  {title: 'Email', key: 'email'},
  {title: 'Type', key: 'type'},
  {title: 'RAD', key: 'rad_id'},
  {title: 'Expires', key: 'expiry_date'},
  {title: 'Has Sign Up', key: 'has_signup', yesno: true}
];

export default class VcAccessDocumentsUnclaimedWithSignupsController extends ClubhouseController {
  @action
  exportToCSV() {
    const rows = this.tickets.map((ticket) => {
      const row = {...ticket};
      row.type = ticketTypeHuman([row.type], {});
      row.rad_id = `RAD-${row.access_document_id}`;
      return row;
    });

    this.download.downloadCsv(`${this.session.currentYear()}-unclaimed-tickets.csv`, CSV_COLUMNS, rows);
  }
}
