import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
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

  @argument classNames;
  @argument size;
  @argument format;
  @argument onChange;
  @argument placeholder;
  @argument autofocus;
  @argument maxlength;
  @argument value;
  @argument autocomplete = "off";

  didInsertElement() {
    $('#'+this.elementId).datetimepicker({
      format: 'Y-m-d H:i',
      inline: false,
      lang: 'en',
      step: 5,
      allowBlank: true,
      onChangeDateTime: (datetime,field) => {
        this.onChange(field.val())
      },
      validateOnBlur: true  // BUG with datepicker. The package will not allow a blank field is validateOnBlur is false.
    });
  }

  willDestroyElement() {
    $('#'+this.elementId).datetimepicker('destroy');
  }
}
