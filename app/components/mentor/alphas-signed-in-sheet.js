import Component from '@glimmer/component';
import _ from 'lodash';
import {GenderIdentityLabels, GENDER_NONE} from "clubhouse/models/person";

const ALPHAS_PER_PAGE = 7;

export default class MentorAlphasSignInSheetComponent extends Component {
  alphasPerPage = ALPHAS_PER_PAGE;

  get alphaPages() {
    // Filter to those only signed in
    return _.chunk(this.args.slot.people.filter((p) => p.on_alpha_shift), ALPHAS_PER_PAGE);
  }

  genderIdentityLabel(id) {
    if (id === GENDER_NONE) {
      return '';
    }
    return GenderIdentityLabels[id] ?? id;
  }
}
