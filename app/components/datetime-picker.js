import Component from '@glimmer/component';
import {action} from '@ember/object';
import { schedule } from '@ember/runloop';

export default class DatetimePickerComponent extends Component {
  constructor() {
    super(...arguments);
    this.dateFormat = this.args.dateOnly ? 'Y-m-d' : 'Y-m-d H:i';
    this.enableTime = !this.args.dateOnly;
  }

  @action
  onChange(_dateObj, dateString) {
    this.args.onChange(dateString);
  }

  @action
  elementInserted(element) {
     if (this.args.autofocus){
      schedule('afterRender', () => element.focus());
    }
  }
}
