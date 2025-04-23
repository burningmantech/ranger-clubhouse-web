import Component from '@glimmer/component';
import {ECHELON} from "clubhouse/constants/person_status";
import {BmidStatusOptions} from "clubhouse/models/bmid";
import { action } from '@ember/object';

export default class BmidEditComponent extends Component {
  bmidStatusOptions = BmidStatusOptions;

  get isEchelon() {
    return this.args.bmid.person.status === ECHELON;
  }

  @action
  updateBmidProvisions(pkg) {
    this.args.bmid.loadProvisions(pkg);
  }
}
