import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';

export default class TicketWizardStepComponent extends Component {
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
}
