import Component from '@glimmer/component';
import {action} from '@ember/object';
import $ from 'jquery';

/*
 * Datetime picker which is a wrapper for https://github.com/xdan/datetimepicker
 *
 * Construct a basic input text element and attach the datepicker to it.
 */

export default class DatetimePickerComponent extends Component {
  element = null;

  @action
  elementInserted(element) {
    this.element = element;
    const options = {
      format: 'Y-m-d H:i',
      inline: false,
      lang: 'en',
      step: 5,
      allowBlank: true,
      onChangeDateTime: (datetime, field) => {
        this.args.onChange(field.val())
      },
      validateOnBlur: true  // BUG with datepicker. The package will not allow a blank field is validateOnBlur is false.
    };

    if (this.args.dateOnly) {
      options.format = 'Y-m-d';
      options.timepicker = false;
    }

    if (this.args.startDate) {
      options.startDate = this.args.startDate;
    }

    $(this.element).datetimepicker(options);
  }

  willDestroyElement() {
    $(this.element).datetimepicker('destroy');
    this.element = null;
  }
}
