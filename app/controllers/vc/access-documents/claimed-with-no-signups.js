import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {TypeLabels} from 'clubhouse/models/access-document';
import {tracked} from '@glimmer/tracking';
import dayjs from "dayjs";

const CSV_COLUMNS = [
  {title: 'Callsign', key: 'callsign'},
  {title: 'Status', key: 'status'},
  {title: 'Email', key: 'email'},
  {title: 'First Name', key: 'first_name'},
  {title: 'Last Name', key: 'last_name'},
  {title: 'Preferred Name', key: 'preferred_name'},
  {title: 'Type', key: 'type'},
  {title: 'RAD', key: 'rad_id'},
  {title: 'OT Completed?', key: 'ot_completed', yesno: true},
  {title: 'Has Signups?', key: 'has_signups', yesno: true},
  {title: 'Did Work?', key: 'did_work', yesno: true},
  {title: 'Trained?', key: 'have_trained', yesno: true},
  {title: 'Trainings', key: 'training_list' },
  {title: 'Training Status', key: 'training_status'}
];

export default class VcAccessDocumentsClaimedWithNoSignupsController extends ClubhouseController {
  @tracked people;

  @action
  exportToCSV() {
    const rows = this.people.map((person) => {
      const slots = [], status = [];

      person.teachings?.forEach((t) => {
        slots.push(dayjs(t.begins).format('YYYY-MM-DD'));
        status.push(`${t.status} (as trainer)`);
      });

      person.trainings?.forEach((t) => {
        slots.push(dayjs(t.begins).format('YYYY-MM-DD'));
        status.push(t.status);
      });

      return {
        ...person,
        type: TypeLabels[person.type] ?? person.type,
        rad_id: `RAD-${person.access_document_id}`,
        training_list: slots.join("\n"),
        training_status: status.join("\n")
      };
    });

    this.house.downloadCsv(`${this.house.currentYear()}-claimed-tickets-no-signups.csv`, CSV_COLUMNS, rows);
  }
}
