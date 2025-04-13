import Component from '@glimmer/component';
import {action} from '@ember/object';
import focusElement from "clubhouse/utils/focus-element";
import { service } from '@ember/service';
import {setting} from "clubhouse/utils/setting";
import AirDatepicker from 'air-datepicker';
import localeEn from 'air-datepicker/locale/en';

export default class DatetimePickerComponent extends Component {
  @service session;

  constructor() {
    super(...arguments);
    let {dateOnly, minDate, maxDate, defaultDate} = this.args;

    this.options = {
      isMobile: this.session.isMobileDevice,
      dateFormat: 'yyyy-MM-dd',
      today: 'Today',
      clear: 'Clear',
      locale: localeEn,
      onSelect:  ({formattedDate})  => this.args.onChange(formattedDate),
    }

    if (!dateOnly) {
      this.options.timepicker = true;
      this.options.timeFormat ='HH:mm';
    }

    if (maxDate) {
      this.options.maxDate = maxDate;
    }

    if (minDate) {
      this.options.minDate = minDate;
    }

    if (defaultDate) {
      this.options.startDate = new Date(defaultDate);
    } else {
      const ghd = setting('GroundhogDayTime');
      if (ghd) {
        this.options.startDate = new Date(ghd);
      }
    }
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.picker?.destroy();
  }

  @action
  onChangeEvent(event) {
    console.log(`EVENT value [${event.target.value}]`);
    this.args.onChange?.(event.target.value);
  }

  @action
  elementInserted(element) {
    this.element = element;
    this.picker = new AirDatepicker(`#${element.id}`, this.options);

    if (this.args.autofocus) {
      focusElement(element);
    }
  }
}
