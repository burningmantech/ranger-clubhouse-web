import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {A} from '@ember/array';
import {schedule} from '@ember/runloop';
import {action} from '@ember/object';

export default class TicketWizardComponent extends Component {
  @service session;
  @service house;

  @tracked stepCount = 0;

  steps = A([]);
  currentStep = null;

  /**
   * Register a child step component, so we know how many steps there are
   * and provide navigation between steps.
   *
   * @param stepComponent
   */

  @action
  registerStep(stepComponent) {
    // Cannot do multiple tracked item updates during the same render cycle
    // schedule register the component after the actions have completed.

    schedule('actions', () => {
      const number = this.steps.length + 1;
      stepComponent.number = number;
      if (number === 1) {
        stepComponent.isActive = true;
        this.currentStep = stepComponent;
      }
      this.steps.pushObject(stepComponent);
      this.stepCount = number;
    });
  }

  /**
   * Go to the next step
   */

  @action
  nextStep() {
    const nextNumber = this.currentStep.number + 1;
    if (nextNumber > this.steps.length) {
      return;
    }
    const step = this.steps.find((s) => s.number === nextNumber);
    this.currentStep.isActive = false;
    this.currentStep.isFinished = true;
    this.currentStep = step;
    step.isActive = true;
  }

  /**
   * Go back to the previous step
   */

  @action
  backStep() {
    const prevNumber = this.currentStep.number - 1;
    if (!prevNumber) {
      return;
    }
    const step = this.steps.find((s) => s.number === prevNumber);
    this.currentStep.isActive = false;
    this.currentStep = step;
    step.isActive = true;
  }

  /**
   * User is all done.
   */
  @action
  finishAction() {
    this.args.onFinish();
  }

  /**
   * User wants to cancel the ticketing steps.
   */
  @action
  cancelAction() {
    this.args.onCancel();
  }
}
