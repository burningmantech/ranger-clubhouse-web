import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, MENTOR, VC} from 'clubhouse/constants/roles';
import {tracked} from '@glimmer/tracking';

class MentorYear {
  @tracked status;
  @tracked newStatus;

  constructor(mentorYear) {
    Object.assign(this, mentorYear);
    this.newStatus = this.status;
  }
}

export default class PersonMentorsRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, MENTOR, VC];

  model() {
    const person = this.modelFor('person');

    return this.ajax.request(`person/${person.id}/mentors`)
      .then((result) => result.mentors);
  }

  setupController(controller, model) {
    controller.set('person', this.modelFor('person'));
    controller.set('mentors', model.map((m) => new MentorYear(m)));
  }
}
