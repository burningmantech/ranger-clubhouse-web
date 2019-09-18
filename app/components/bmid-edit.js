import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';
import {
  MealOptions,
  BmidStatusOptions,
  ShowerOptions
} from 'clubhouse/constants/bmid';

export default class BmidEditComponent extends Component {
  @argument('object') entry;
  @argument('number') year;
  @argument('object') onSave;
  @argument(optional('object')) onCancel;
  @argument(optional('boolean')) modalBox = true;
  @argument('object') admissionDateOptions;

  bmidStatusOptions = BmidStatusOptions;
  mealOptions = MealOptions;
  showerOptions = ShowerOptions;
}
