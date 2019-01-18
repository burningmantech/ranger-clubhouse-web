import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';
import { tagName } from '@ember-decorators/component';
import $ from 'jquery';

/*
 * Datetime picker which is a wrapper for https://github.com/xdan/datetimepicker
 *
 * Construct a basic input text element and attach the datepicker to it.
 */

@tagName('input')
export default class DatetimePickerComponent extends Component {
  attributeBindings = [ 'type', 'size', 'placeholder', 'autofocus', 'maxlength', 'value', 'autocomplete' ];
  classNameBindings = [ 'classNames' ];

  @argument(optional('any')) classNames;

  @argument(optional('number')) size;
  @argument(optional('string')) format;
  @argument(optional('object')) onChange;
  @argument(optional('string')) placeholder;
  @argument(optional('boolean')) autofocus;
  @argument(optional('number')) maxlength;
  @argument(optional('any')) value;
  @argument(optional('string')) autocomplete = "off";
  @argument(optional('boolean')) dateOnly; // set true if only want to deal with dates, no time.
  @argument(optional('string')) startDate;

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
