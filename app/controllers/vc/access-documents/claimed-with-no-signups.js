import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {TypeLabels} from 'clubhouse/models/access-document';
import {tracked} from '@glimmer/tracking';

const CSV_COLUMNS = [
  {title: 'Callsign', key: 'callsign'},
  {title: 'Status', key: 'status'},
  {title: 'Email', key: 'email'},
  {title: 'First Name', key: 'first_name'},
  {title: 'Last Name', key: 'last_name'},
  {title: 'Type', key: 'type'},
  {title: 'RAD', key: 'rad_id'},
  {title: 'OT Completed?', key: 'ot_completed', yesno: true},
  {title: 'Has Signups?', key: 'has_signups', yesno: true},
  {title: 'Did Work?', key: 'did_work', yesno: true}
];

export default class VcAccessDocumentsClaimedWithNoSignupsController extends ClubhouseController {
  @tracked people;

  @action
  exportToCSV() {
    const rows = this.people.map((person) => ({
      ...person,
      type: TypeLabels[person.type] || person.type,
      rad_id: `RAD-${person.access_document_id}`
    }));

    this.house.downloadCsv(`${this.house.currentYear()}-claimed-tickets-no-signups.csv`, CSV_COLUMNS, rows);
  }
}
