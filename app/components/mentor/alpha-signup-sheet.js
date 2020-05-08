import Component from '@glimmer/component';
import _ from 'lodash';

const ALPHAS_PER_PAGE = 6;

export default class MentorAlphaSignupComponent extends Component {
  alphasPerPage = ALPHAS_PER_PAGE;

  get alphaPages() {
    return _.chunk(this.args.slot.people, ALPHAS_PER_PAGE);
  }
}
