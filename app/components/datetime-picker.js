import Component from '@ember/component';
import $ from 'jquery';

/*
 * Datetime picker which is a wrapper for https://github.com/xdan/datetimepicker
 *
 * Construct a basic input text element and attach the datepicker to it.
 */

export default class DatetimePickerComponent extends Component {
  tagName = 'input';
  attributeBindings = [ 'type', 'size', 'placeholder', 'autofocus', 'maxlength', 'value', 'autocomplete' ];
  classNameBindings = [ 'classNames' ];

  classNames = null;

  size = null;
  format = null;
  onChange = null;
  placeholder = null;
  autofocus = null;
  maxlength = null;
  value = null;
  autocomplete = "off";
  dateOnly = null; // set true if only want to deal with dates, no time.
  startDate = null;

  didInsertElement() {
    const options = {
      format: 'Y-m-d H:i',
      inline: false,
      lang: 'en',
      step: 5,
      allowBlank: true,
      onChangeDateTime: (datetime,field) => {
        this.onChange(field.val())
      },
      validateOnBlur: true  // BUG with datepicker. The package will not allow a blank field is validateOnBlur is false.
    };

    if (this.dateOnly) {
      options.format = 'Y-m-d';
      options.timepicker = false;
    }

    if (this.startDate) {
      options.startDate = this.startDate;
    }

    $('#'+this.elementId).datetimepicker(options);
  }

  willDestroyElement() {
    $('#'+this.elementId).datetimepicker('destroy');
  }
}
