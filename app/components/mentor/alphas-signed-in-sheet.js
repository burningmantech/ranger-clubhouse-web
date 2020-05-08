import Component from '@glimmer/component';
import _ from 'lodash';

const ALPHAS_PER_PAGE = 7;

export default class MentorAlphasSignInSheetComponent extends Component {
  alphasPerPage = ALPHAS_PER_PAGE;

  get alphaPages() {
    // Filter to those only signed in
    return _.chunk(this.args.slot.people.filter((p) => p.on_alpha_shift), ALPHAS_PER_PAGE);
  }
}
