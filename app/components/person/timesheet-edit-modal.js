import Component from '@glimmer/component';
import validateDateTime from "clubhouse/validators/datetime";
import {validatePresence} from 'ember-changeset-validations/validators';
import {isEmpty} from '@ember/utils';
import dayjs from 'dayjs';

export default class PersonTimesheetEditModalComponent extends Component {
  reviewOptions = [
    ['Correction approved', 'approved'],
    ['Correction rejected', 'rejected'],
    ['Correction requested', 'pending'],
    ['Entry verified', 'verified'],
    ['Entry unverified', 'unverified']
  ];

  timesheetValidations = {
    on_duty: [validateDateTime({before: 'off_duty'}), validatePresence({presence: true})],
    off_duty: [validateDateTime({after: 'on_duty'})],
  };

  /**
   * Return the duration in hours & minutes. Takes into account invalid or blank dates.
   *
   * @param model
   * @returns {string}
   */

  entryDuration(model) {
    if (isEmpty(model.on_duty) || isEmpty(model.off_duty)) {
      return '-';
    }

    const start = dayjs(model.on_duty), end = dayjs(model.off_duty);
    if (!start.isValid() || !end.isValid()) {
      return '-';
    }

    const duration = end.diff(start, 's');
    const minutes = Math.floor((duration / 60) % 60);
    const hours = Math.floor(duration / 3600);

    let time = `${minutes} min${minutes === 1 ? '' : 's'}`;

    if (hours) {
      time = `${hours} hour${hours === 1 ? '' : 's'} ${time}`;
    }

    return time;
  }
}
