import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default class MentorMenteesController extends Controller {
  queryParams = [ 'year' ];

  @computed('mentees')
  get bonkedCount() {
    return this.mentees.filter((mentee) => mentee.mentor_status == 'bonk').length;
  }

  @computed('mentees')
  get passedCount() {
    return this.mentees.filter((mentee) => mentee.mentor_status == 'pass').length;
  }
}
