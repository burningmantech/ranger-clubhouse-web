import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {schedule,later} from '@ember/runloop';

export default class ChAccordionComponent extends Component {
  @tracked isOpen = false;
  @tracked bodyOpened = false;
  @tracked isWorking = false;

  constructor() {
    super(...arguments);
    this.bodyOpened = this.isOpen = this.args.isInitOpen;
  }

  @action
  onInsert() {
    this.args.onInsert?.(this);
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.args.onWillDestroy?.(this);
  }

  @action
  onClickAction() {
    if (this.isOpen) {
      // Close up, onHidden event will set isOpen to false.
      this.bodyOpened = false;
      return;
    }

    this.isWorking = true;

    // Allow the spinning icon to be rendered before opening the body.
    later(() => {
      this.isOpen = true;
      this.args.onClick?.(true);
      // Reveal body after it has rendered
      schedule('afterRender', () => {
        this.bodyOpened = true;
        this.isWorking = false;
      });
    }, 100);
  }

  @action
  onShown() {
    this.isOpening = false;
  }

  @action
  onHidden() {
    this.isOpen = false;
    this.args.onClick?.(false);
  }
}
