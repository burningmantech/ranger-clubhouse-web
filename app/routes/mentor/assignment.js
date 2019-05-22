import Route from '@ember/routing/route';
import RSVP from 'rsvp';

const MENTOR_COUNT = 3;

export default class MentorAssignmentRoute extends Route {
  model() {
    return RSVP.hash({
      alphas: this.ajax.request('mentor/alphas').then((result) => result.alphas),
      mentors: this.ajax.request('mentor/mentors').then((result) => result.mentors)
    });
  }

  setupController(controller, model) {
    const year = this.house.currentYear();
    const alphas = model.alphas;

    /*
     * Run thru the alphas and find the current mentor assignments
     */

    alphas.forEach((person) => {
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
      for (let i = mentors.length; i < MENTOR_COUNT; i++){
        mentors.push({ mentor_id: null });
      }

      person.mentors = mentors;
    });

    controller.set('alphas', alphas);
    controller.set('mentors', model.mentors);
    controller.set('year', year);
    controller.set('filter', 'all');
  }
}
