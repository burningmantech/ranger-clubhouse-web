import Component from '@glimmer/component';
import {
  MealOptions,
  BmidStatusOptions,
  ShowerOptions
} from 'clubhouse/models/bmid';
import {ECHELON} from "clubhouse/constants/person_status";

export default class BmidEditComponent extends Component {
  bmidStatusOptions = BmidStatusOptions;
  mealOptions = MealOptions;
  showerOptions = ShowerOptions;

  get isEchelon() {
    return this.args.entry.person.status === ECHELON;
  }
}
