import Component from '@glimmer/component';
import validateDateTime from "clubhouse/validators/datetime";
import {validatePresence} from 'ember-changeset-validations/validators';
import {isEmpty} from '@ember/utils';
import dayjs from 'dayjs';
import {action} from '@ember/object';
import {shiftFormat} from "clubhouse/helpers/shift-format";
import {htmlSafe} from '@ember/template';
import {cached} from '@glimmer/tracking';
import {service} from '@ember/service';

export default class PersonTimesheetEditModalComponent extends Component {
  @service modal;

  reviewOptions = [
    ['Correction approved', 'approved'],
    ['Correction rejected', 'rejected'],
    ['Correction requested', 'pending'],
    ['Entry verified', 'verified'],
    ['Entry unverified', 'unverified']
  ];

  timesheetValidations = {
    off_duty: [validateDateTime({after: 'on_duty'})],
  };

  constructor() {
    super(...arguments);

    this.timesheetValidations.on_duty = [
      this.args.entry.stillOnDuty ? validateDateTime() : validateDateTime({before: 'off_duty'}),
      validatePresence({presence: true})
    ];
  }

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

  @action
  populatedDesiredChanges(model) {
    const {entry} = this.args;

    if (!isEmpty(entry.desired_position_id)) {
      if (!this.args.positions.find((p) => +p.id === +entry.desired_position_id)) {
        this.modal.info('Position not found',
          'The desired position was not granted to the individual. It is likely that the position was revoked between the time the correction was submitted and now. Please contact the appropriate cadre to inquire about what happened.');
        return;
      }
      model.position_id = entry.desired_position_id;
    }

    if (!isEmpty(entry.desired_on_duty)) {
      model.on_duty = entry.desired_on_duty;
    }

    if (!isEmpty(entry.desired_off_duty)) {
      model.off_duty = entry.desired_off_duty;
    }
  }

  @cached
  get timeWarningsMessage() {
    if(this.args.entry.stillOnDuty) {
      return '';
    }

    const tw = this.args.entry.time_warnings;

    return htmlSafe(
      this._alertRange('On Duty', tw.start, tw.start_status, tw.begins, tw.ends)
      + this._alertRange('Off Duty', tw.finished, tw.finished_status, tw.begins, tw.ends)
    );
  }

  @cached
  get desiredWarningsMessage() {
    if(this.args.entry.stillOnDuty) {
      return '';
    }
    const tw = this.args.entry.desired_warnings;

    return htmlSafe(
      this._alertRange('On Duty', tw.start, tw.start_status, tw.begins, tw.ends)
      + this._alertRange('Off Duty', tw.finished, tw.finished_status, tw.begins, tw.ends)
    );
  }

  _alertRange(label, date, status, begins, ends) {
    if(this.args.entry.stillOnDuty || status === 'success') {
      return '';
    }

    if (status === 'before-begins') {
      return `<li >The ${label} time ${shiftFormat([date], {})} <b class="text-danger">is BEFORE the very first shift of the event</b> starting on ${shiftFormat([begins], {})}.</li>`;
    } else {
      return `<li>The ${label} time ${shiftFormat([date], {})} <b class="text-danger">is AFTER the very last shift of the event</b> ending on ${shiftFormat([ends], {})}.</li>`;
    }
  }
}
