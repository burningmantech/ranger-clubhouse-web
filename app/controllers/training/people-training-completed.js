import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';

const CSV_COLUMNS = [
  {title: 'Session', key: 'begins'},
  {title: 'Description', key: 'description'},
  {title: 'Trainee', key: 'callsign'},
]
export default class TrainingPeopleTrainingCompletedController extends ClubhouseController {
  queryParams = ['year'];

  @tracked year;
  @tracked slots;

  @action
  exportToCSV() {
    const rows = [];
    const addEmail = this.session.canViewEmail;
    const csvColumns = [...CSV_COLUMNS];
    if (addEmail) {
      csvColumns.push({title: 'Email', key: 'email'});
    }
    this.slots.forEach(slot => {
      slot.people.forEach(person => {
        const row = {
          begins: slot.slot_begins,
          description: slot.slot_description,
          callsign: person.callsign,
        };

        if (addEmail) {
          row.email = person.email;
        }
        rows.push(row);
      })
    })

    this.house.downloadCsv(`${this.year}-training-completed`, csvColumns, rows);
  }
}
