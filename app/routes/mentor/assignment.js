import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import RSVP from 'rsvp';
import {tracked} from '@glimmer/tracking';

const MENTOR_COUNT = 3;

class Alpha {
  @tracked error;
  @tracked mentors;

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

    const alphas = model.alphas.map((person) => {
      const current = person.mentor_history.find((history) => history.year == year);
      const mentors = [];

      if (current) {
        person.mentor_status = current.status;
        current.mentors.forEach((mentor) => {
          mentors.push({
            mentor_id: mentor.id,
            person_mentor_id: mentor.person_mentor_id
          });
        });
        // remove the current mentors so it does not appear int the prior list
        person.mentor_history.removeObject(current);
      } else {
        person.mentor_status = 'pending';
      }

      // Pad out the mentor list
      for (let i = mentors.length; i < MENTOR_COUNT; i++) {
        mentors.push({mentor_id: null});
      }

      person.mentors = mentors;
      person.error = null;

      return new Alpha(person);
    });

    controller.set('alphas', alphas);
    controller.set('mentors', model.mentors);
    controller.set('year', year);
    controller.set('filter', 'all');
    controller.set('isPrinting', false);
  }
}
