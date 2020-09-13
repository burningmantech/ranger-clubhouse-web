import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class BehavioralAgreementModalComponent extends Component {
  @tracked documentLoaded = false;

  @action
  documentLoadedAction() {
    this.documentLoaded = true;
  }
}
