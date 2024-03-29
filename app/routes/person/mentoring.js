import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, MENTOR, VC} from 'clubhouse/constants/roles';
import {tracked} from '@glimmer/tracking';
import menteeSetupController from "clubhouse/utils/mentee-setup-controller";

class MentorYear {
  @tracked status;
  @tracked newStatus;

  constructor(mentorYear) {
    Object.assign(this, mentorYear);
    this.newStatus = this.status;
  }
}

export default class PersonMentoringRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, MENTOR, VC];

  async model() {
    const person = this.modelFor('person');

    return {
      mentors: await this.ajax.request(`person/${person.id}/mentors`).then((result) => result.mentors),
      mentees: await this.ajax.request(`person/${person.id}/mentees`).then((result) => result.mentees),
    };
  }

  setupController(controller, model) {
    controller.person = this.modelFor('person');
    controller.mentors = model.mentors.map((m) => new MentorYear(m));
    menteeSetupController(controller, model.mentees);
  }
}
