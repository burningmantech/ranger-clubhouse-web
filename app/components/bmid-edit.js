import Component from '@glimmer/component';
import {
  MealOptions,
  BmidStatusOptions,
  ShowerOptions
} from 'clubhouse/models/bmid';
import {NON_RANGER} from "clubhouse/constants/person_status";

export default class BmidEditComponent extends Component {
  bmidStatusOptions = BmidStatusOptions;
  mealOptions = MealOptions;
  showerOptions = ShowerOptions;

  get isNonRanger() {
    return this.args.entry.person.status === NON_RANGER;
  }
}
