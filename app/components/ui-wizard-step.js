import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';

export default class UiWizardStepComponent extends Component {
  @tracked isActive = false;
  @tracked isFinished = false;
  @tracked number = 0;

  constructor() {
    super(...arguments);

    this.wizard = this.args.wizard;
    const {title, shortTitle} = this.args;
    this.title = title;
    this.shortTitle = shortTitle;
    this.wizard.registerStep(this);
  }

  get nextLabel() {
    return this.args.nextLabel ?? this.wizard.nextLabel;
  }

  @action
  nextAction() {
    const {nextAction} = this.args;
    if (nextAction) {
      nextAction(this.wizard.nextStep);
    } else {
      this.wizard.nextStep();
    }
  }

  get finishLabel() {
    return this.args.finishLabel ?? this.wizard.finishLabel;
  }

  @action
  finishAction() {
    const {finishAction} = this.args;
    if (finishAction) {
      finishAction(this.wizard.finishAction);
    } else {
      this.wizard.finishAction();
    }
  }

}
