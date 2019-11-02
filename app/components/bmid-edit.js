import Component from '@ember/component';


import {
  MealOptions,
  BmidStatusOptions,
  ShowerOptions
} from 'clubhouse/constants/bmid';

export default class BmidEditComponent extends Component {
  entry = null;
  year = null;
  onSave = null;
  onCancel = null;
  modalBox = true;
  admissionDateOptions = null;

  bmidStatusOptions = BmidStatusOptions;
  mealOptions = MealOptions;
  showerOptions = ShowerOptions;
}
