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
}
