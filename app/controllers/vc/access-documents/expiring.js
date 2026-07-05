import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {ticketTypeHuman} from 'clubhouse/helpers/ticket-type-human';
import {mdyFormat} from 'clubhouse/helpers/mdy-format';
import {action} from '@ember/object';

const CSV_COLUMNS = [
  {title: 'Callsign', key: 'callsign'},
  {title: 'Status', key: 'status'},
  {title: 'Email', key: 'email'},
  {title: 'RAD', key: 'rad'},
  {title: 'Ticket Type', key: 'ticket_type'},
  {title: 'Ticket Status', key: 'ticket_status'},
  {title: 'Good Through', key: 'good_through'},
];

export default class VcAccessDocumentsExpiringController extends ClubhouseController {

  /**
   * Flatten the expiring people/tickets into one row per ticket. Both the
   * template's table and the CSV export are driven from this so the two cannot
   * drift (unknown ticket types and date formatting stay in sync).
   */
  get expiringRows() {
    const rows = [];
    this.expiring.forEach((person) => {
      person.tickets.forEach((ticket) => {
        rows.push({
          person: person.person,
          rad: `RAD-${ticket.id}`,
          ticket_type: ticketTypeHuman([ticket.type], {}),
          ticket_status: ticket.status,
          good_through: mdyFormat([ticket.expiry_date], {}),
        });
      });
    });
    return rows;
  }

  @action
  exportCSV() {
    const data = this.expiringRows.map((row) => ({
      callsign: row.person.callsign,
      status: row.person.status,
      email: row.person.email,
      rad: row.rad,
      ticket_type: row.ticket_type,
      ticket_status: row.ticket_status,
      good_through: row.good_through,
    }));
    this.download.downloadCsv(`${this.session.currentYear()}-expiring-access-documents.csv`, CSV_COLUMNS, data);
  }

  get emailList() {
    return this.expiring.map((person) => person.person);
  }
}
