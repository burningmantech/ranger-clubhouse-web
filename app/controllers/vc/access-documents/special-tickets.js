import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {tracked} from '@glimmer/tracking';
import {StatusLabels, TypeShortLabels} from 'clubhouse/models/access-document';
import {action} from '@ember/object'

const CSV_COLUMNS = [
  { title: 'Callsign', key: 'callsign' },
  { title: 'Status', key: 'status'},
  { title: 'Ticket', key: 'ticket'},
  { title: 'Ticket Status', key: 'ticket_status' },
  { title: 'RAD', key: 'rad' }
];

export default class VcAccessDocumentsSpecialTicketsController extends ClubhouseController {
  @tracked tickets;

  ticketTypeLabel(type) {
    return TypeShortLabels[type] ?? type;
  }

  ticketStatusLabel(status) {
    return StatusLabels[status] ?? status;
  }

  @action
  exportToCSV() {
    const rows = this.tickets.map((ad) => ({
      callsign: ad.person.callsign,
      status: ad.person.status,
      ticket: TypeShortLabels[ad.type] ?? ad.type,
      ticket_status: StatusLabels[ad.status] ?? ad.status,
      rad: `RAD-${ad.id}`
    }));

    this.house.downloadCsv(`${this.house.currentYear()}-special-tickets.csv`, CSV_COLUMNS, rows);
  }
}
