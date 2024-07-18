import Component from '@glimmer/component';
import {action} from '@ember/object';
import focusElement from "clubhouse/utils/focus-element";
import tempusdominus from '@eonasdan/tempus-dominus';
import {later} from '@ember/runloop';
import { service } from '@ember/service';
import {setting} from "clubhouse/utils/setting";

export default class DatetimePickerComponent extends Component {
  @service session;

  constructor() {
    super(...arguments);
    let {dateOnly, minDate, maxDate, viewDate, defaultDate} = this.args;

    this.config = {
      allowInputToggle: true,
      useCurrent: false,
      localization: {
        locale: 'en',
        hourCycle: 'h23',
        format: dateOnly ? 'yyyy-MM-dd' : 'yyyy-MM-dd HH:mm',
        dayViewHeaderFormat: {month: 'long', year: 'numeric'},
      },
      keepInvalid: true,
      display: {
        theme: 'light',
        sideBySide: true,
        keepOpen: true,
        buttons: {
          close: true
        },
        icons: {
          close: 'fa-solid fa-xmark calendar-close-text'
        }
      },
      restrictions: {
        minDate, maxDate
      }
    }

    if (dateOnly) {
      this.config.display.sideBySide = false;
      this.config.display.components = {
        hours: false,
        minutes: false,
        seconds: false
      }
    }

    if (viewDate) {
      this.config.viewDate = new Date(viewDate);
    } else if (this.session.isGroundhogDayServer) {
      this.config.viewDate = new Date(setting('GroundhogDayTime'));
    }

    if (defaultDate) {
      this.config.defaultDate = new Date(defaultDate);
    }
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.picker?.dispose();
  }

  @action
  changeEvent(event) {
    this.args.onChange(event.target.value);
  }

  @action
  blurEvent() {
    later(() => {
      if (document.activeElement !== this.element && document.activeElement.tagName === 'INPUT') {
        this.picker?.hide();
      }
    }, 100);
  }

  @action
  elementInserted(element) {
    this.element = element;
    this.picker = new tempusdominus.TempusDominus(element, this.config);
    this.picker.dates.oldParseInput = this.picker.dates.parseInput;
    this.picker.dates.parseInput = (input) => {
      try {
        return this.picker.dates.oldParseInput(input);
      } catch (err) {
        if (err.code === 5 || err.code === 9) {
          // Invalid date/time format.
          this.args.onInvalidInput?.(input);
          this.picker.hide();
        } else {
          throw err;
        }
      }
    };

    if (this.args.autofocus) {
      focusElement(element);
    }
  }
}
