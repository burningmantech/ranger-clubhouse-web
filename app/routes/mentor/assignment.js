import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import RSVP from 'rsvp';
import {tracked} from '@glimmer/tracking';
import dayjs from 'dayjs';

const MENTOR_COUNT = 3;

class Mentor {
  @tracked mentor_id;
  @tracked person_mentor_id;

  constructor(mentorId = null, personMentorId = null) {
    this.mentor_id = mentorId;
    this.person_mentor_id = personMentorId;
  }
}

class Alpha {
  @tracked error;
  @tracked mentors;
  @tracked selected;
  @tracked mentor_status;

  constructor(person) {
    Object.assign(this, person);
  }
}

export default class MentorAssignmentRoute extends ClubhouseRoute {
  model() {
    return RSVP.hash({
      alphas: this.ajax.request('mentor/alphas').then((result) => result.alphas),
      mentors: this.ajax.request('mentor/mentors').then((result) => result.mentors)
    });
  }

  setupController(controller, model) {
    const year = this.house.currentYear();

    /*
     * Run thru the alphas and find the current mentor assignments
     */

    const shifts = {};

    const alphas = model.alphas.map((person) => {
      const current = person.mentor_history.find((history) => history.year == year);
      const mentors = [];

      if (current) {
        person.mentor_status = current.status;
        current.mentors.forEach((mentor) => {
          mentors.push(new Mentor(mentor.id, mentor.person_mentor_id));
        });
        // remove the current mentors so it does not appear int the prior list
        person.mentor_history.removeObject(current);
      } else {
        person.mentor_status = 'pending';
      }

      // Pad out the mentor list
      for (let i = mentors.length; i < MENTOR_COUNT; i++) {
        mentors.push(new Mentor);
      }

      person.mentors = mentors;
      person.error = null;

      if (person.alpha_slot) {
        shifts[person.alpha_slot.begins] = true;
      }
      return new Alpha(person);
    });

    const shiftOptions = Object.keys(shifts).sort().map((shift) => [ dayjs(shift).format('ddd MMM DD [@] HH:mm'), shift ]);
    shiftOptions.unshift([ 'Not Checked In', 'not-checked-in' ]);
    shiftOptions.unshift([ 'All', 'all']);

    controller.set('alphas', alphas);
    controller.set('mentors', model.mentors);
    controller.set('year', year);
    controller.set('filter', 'all');
    controller.set('isPrinting', false);
    controller.set('shiftFilterOptions', shiftOptions);
    controller.set('shiftFilter', 'all');

    controller.set('selectAll', false);
  }
}
