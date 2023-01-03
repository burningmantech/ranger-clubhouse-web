import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import dayjs from 'dayjs';
import {TypeLabels} from 'clubhouse/models/access-document';
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

  @action
  exportCSV() {
    let data = [];
    this.expiring.forEach((row) => {
      row.tickets.forEach((ticket) => {
        data.push({
            'callsign': row.person.callsign,
            'status': row.person.status,
            'email': row.person.email,
            'rad': `RAD-${ticket.id}`,
            'ticket_type': TypeLabels[ticket.type] ?? ticket.type,
            'ticket_status': ticket.status,
            'good_through': dayjs(ticket.expiry_date).format('YYYY-MM-DD'),
        });
      });
    });
    this.house.downloadCsv(`${this.house.currentYear()}-expiring-access-documents.csv`, CSV_COLUMNS, data);
  }

  get emailList() {
    return this.expiring.map((person) => person.person);
  }
}
