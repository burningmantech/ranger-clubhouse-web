import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class MeMentorsController extends ClubhouseController {
  @tracked mentors = [];
  @tracked contactMentor;

  @action
  contactAction(mentor) {
    this.contactMentor = mentor;
  }

  @action
  finished() {
    this.contactMentor = null;
  }
}
