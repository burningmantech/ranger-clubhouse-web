import Component from '@glimmer/component';
import {
  MealOptions,
  BmidStatusOptions,
  ShowerOptions
} from 'clubhouse/models/bmid';

export default class BmidEditComponent extends Component {
  bmidStatusOptions = BmidStatusOptions;
  mealOptions = MealOptions;
  showerOptions = ShowerOptions;

  get notQualified() {
    const {entry} = this.args;
    return !entry.has_ticket && !entry.training_signed_up;
  }
}
