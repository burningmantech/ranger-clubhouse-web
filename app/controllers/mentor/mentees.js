import Controller from '@ember/controller';
import { action, computed } from '@ember/object';

export default class MentorMenteesController extends Controller {
  queryParams = ['year'];

  @computed('mentees')
  get bonkedCount() {
    return this.mentees.filter((mentee) => mentee.mentor_status == 'bonk').length;
  }

  @computed('mentees')
  get passedCount() {
    return this.mentees.filter((mentee) => mentee.mentor_status == 'pass').length;
  }

  @action
  exportToCSV() {
    const canViewEmail = this.house.canViewEmail;

    const CSV_COLUMNS = [
      { title: 'Callsign', key: 'callsign' },
      { title: 'First Name', key: 'first_name' },
      { title: 'Last Name', key: 'last_name' },
      { title: 'Status', key: 'status' },
      { title: 'Mentor 1', key: 'mentor1' },
      { title: 'Mentor 2', key: 'mentor2' },
      { title: 'Mentor 3', key: 'mentor3' },
      { title: 'Pass', key: 'mentor_status' },
    ];

    if (canViewEmail) {
      CSV_COLUMNS.splice(4, 0, { title: 'Email', key: 'email' });
    }
    const people = [];

    this.mentees.forEach((mentee) => {
      const person = {
        callsign: mentee.callsign,
        first_name: mentee.first_name,
        last_name: mentee.last_name,
        status: mentee.status,
        mentor_status: mentee.mentor_status
      };

      mentee.mentors.forEach((mentor, idx) => {
        person['mentor' + (idx + 1)] = mentor.callsign;
      });

      if (canViewEmail) {
        person.email = mentee.email;
      }

      people.push(person);
    });

    this.house.downloadCsv(`${this.year}-mentees.csv`, CSV_COLUMNS, people);
  }
}
