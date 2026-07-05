import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {ticketTypeHuman} from 'clubhouse/helpers/ticket-type-human';
import {ymdFormat} from 'clubhouse/helpers/ymd-format';
import {tracked} from '@glimmer/tracking';

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

// Build a single combined, chronologically-sorted list of training slots for a
// person so the on-page columns and the CSV export always agree. Trainee slots
// come from `trainings`, trainer slots from `teachings` (flagged so their status
// reads "... (as trainer)").
function trainingSlotsFor(person) {
  const slots = [
    ...(person.trainings ?? []).map((slot) => ({begins: slot.begins, status: slot.status})),
    ...(person.teachings ?? []).map((slot) => ({begins: slot.begins, status: `${slot.status} (as trainer)`}))
  ];

  return slots.sort((a, b) => (a.begins < b.begins ? -1 : (a.begins > b.begins ? 1 : 0)));
}

export default class VcAccessDocumentsClaimedWithNoSignupsController extends ClubhouseController {
  @tracked people;

  get peopleWithTrainingSlots() {
    return this.people.map((person) => ({person, trainingSlots: trainingSlotsFor(person)}));
  }

  @action
  exportToCSV() {
    const rows = this.people.map((person) => {
      const trainingSlots = trainingSlotsFor(person);

      return {
        ...person,
        type: ticketTypeHuman([person.type], {}),
        rad_id: `RAD-${person.access_document_id}`,
        training_list: trainingSlots.map((slot) => ymdFormat([slot.begins])).join("\n"),
        training_status: trainingSlots.map((slot) => slot.status).join("\n")
      };
    });

    this.download.downloadCsv(`${this.session.currentYear()}-claimed-tickets-no-signups.csv`, CSV_COLUMNS, rows);
  }
}
