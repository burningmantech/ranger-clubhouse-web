import ChFormFieldBaseComponent from './field-base';
import {tracked} from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ChFormTextareaFieldComponent extends ChFormFieldBaseComponent {
  @tracked loadFailure = false;

  controlClassDefault = 'form-control';


  @action
  editorFailedToLoad() {
    this.editorFailed = true;
  }
}
