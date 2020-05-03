import Component from '@ember/component';
import { computed } from '@ember/object';
import _ from 'lodash';

const ALPHAS_PER_PAGE = 6;

export default class MentorAlphaSignupComponent extends Component {
  alphasPerPage = ALPHAS_PER_PAGE;

  @computed('slot.people')
  get alphaPages() {
    return _.chunk(this.slot.people, ALPHAS_PER_PAGE);
  }
}
