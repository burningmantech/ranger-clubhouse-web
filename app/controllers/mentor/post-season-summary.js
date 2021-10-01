import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action, set } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class MentorPostSeasonSummaryController extends ClubhouseController {
  queryParams = ['year'];

  @tracked filter = 'all';
  @tracked mentees;

  filterOptions = [
    {id: 'all', title: 'All'},
    {id: 'pass', title: 'Passed'},
    {id: 'bonked', title: 'Bonked'},
    {id: 'no-walk', title: 'Did not walk' },
  ];

  get bonkedCount() {
    return this.mentees.filter((m) => (m.mentor_status === 'bonk' || m.mentor_status === 'self-bonk' || m.status === 'uberbonked')).length;
  }

  get passedCount() {
    return this.mentees.filter(({mentor_status}) => mentor_status === 'pass').length;
  }

  get viewMentees() {
    const mentees = this.mentees;

    switch (this.filter) {
      case 'pass':
        return mentees.filter(({mentor_status}) => mentor_status === 'pass');
      case 'bonked':
        // Filter on mentor bonk, self-bonk, or uberbonk (person status, not mentor status)
        return mentees.filter((m) => (m.mentor_status === 'bonk' || m.mentor_status === 'self-bonk' || m.status === 'uberbonked'));
      case 'no-walk':
        return mentees.filter((m) => (m.mentor_status === 'pending' && !m.alpha_shift));
      default:
        return mentees;
    }
  }

  @action
  exportToCSV() {
    const canViewEmail = this.session.canViewEmail;

    const CSV_COLUMNS = [
      {title: `Callsign (${this.filter})`, key: 'callsign'},
      {title: 'First Name', key: 'first_name'},
      {title: 'Last Name', key: 'last_name'},
      {title: 'Status', key: 'status'},
      {title: 'Mentor 1', key: 'mentor1'},
      {title: 'Mentor 2', key: 'mentor2'},
      {title: 'Mentor 3', key: 'mentor3'},
      {title: 'Pass', key: 'mentor_status'},
    ];

    if (canViewEmail) {
      CSV_COLUMNS.splice(4, 0, {title: 'Email', key: 'email'});
    }
    const people = [];

    this.viewMentees.forEach((mentee) => {
      const person = {
        callsign: mentee.callsign,
        first_name: mentee.first_name,
        last_name: mentee.last_name,
        status: mentee.status,
        mentor_status: mentee.mentor_status
      };

      if (mentee.mentors) {
        mentee.mentors.forEach((mentor, idx) => {
          person['mentor' + (idx + 1)] = mentor.callsign;
        });
      }

      if (canViewEmail) {
        person.email = mentee.email;
      }

      people.push(person);
    });

    this.house.downloadCsv(`${this.year}-mentees-${this.filter}.csv`, CSV_COLUMNS, people);
  }

  setupMentees() {
    const year = this.year;
    this.mentees.forEach((m) => {
      let mentorStatus = 'pending';
      m.mentor_history.forEach((h) => {
        if (h.year == year) {
          mentorStatus = h.status;
          set(m, 'mentors', h.mentors);
        }
      });
      set(m, 'mentor_status', mentorStatus);
    });
  }

  @action
  noteSubmitted(person) {
    // Refresh the potentials
    this.ajax.request('mentor/mentees', {data: { year: this.year, person_id: person.id }}).then(({ mentee }) => {
      this.mentees = this.mentees.map((m) => m.id == person.id ? mentee : m);
      this.setupMentees();
    }).catch((response) => this.house.handleErrorResponse(response));
  }
}
