import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {isEmpty} from '@ember/utils';
import {STATUS_PENDING, STATUS_VERIFIED} from "clubhouse/models/timesheet";
import currentYear from 'clubhouse/utils/current-year';
import dayjs from "dayjs";

export default class MeTimesheetReviewCommonComponent extends Component {
  @service modal;
  @service session;
  @service shiftManage;
  @service toast;

  @tracked entry = null; // Incorrect entry
  @tracked desiredPositionOptions;

  constructor() {
    super(...arguments);
  }

  get isMe() {
    return +this.args.person.id === this.session.userId;
  }

  get correctionsEnabled() {
    return this.args.year === currentYear() && this.args.timesheetInfo.correction_enabled;
  }

  @action
  toggleNotes(ts) {
    ts.showNotes = !ts.showNotes;
  }

  // Mark an entry as correct
  @action
  async markCorrectAction(timesheet) {
    timesheet.review_status = STATUS_VERIFIED;
    try {
      await timesheet.save();
      this.args.onVerified?.();
      this.toast.success('The entry has been marked as correct.');
    } catch (response) {
      this.house.handleErrorResponse(response);
    }
  }

  // Setup to mark an entry as incorrect - i.e. display the form
  @action
  markIncorrectAction(timesheet) {
    this.entry = timesheet;
    this.desiredPositionOptions = this.args.positions.map((p) => [p.title, p.id]);
    this.desiredPositionOptions.unshift({
      id: null,
      title: `${timesheet.position.title} is correct`,
    })
  }

  // Save correction notes
  @action
  saveCorrectionAction(model) {
    if (!model.desired_position_id && !model.desired_on_duty && !model.desired_off_duty) {
      this.modal.info('No corrections entered',
        'You did not select a position, and/or enter the correct start or ending times');
      return;
    }

    if (isEmpty(model.additional_notes) && !this.entry.notes.length) {
      model.addError('additional_notes', 'Enter a reason why this entry should be corrected.');
      return;
    }

    const positionId = model.desired_position_id ?? model.position_id,
      onDuty = model.desired_on_duty ?? model.on_duty,
      offDuty = model.desired_off_duty ?? model.off_duty;

    if (dayjs(offDuty).isBefore(dayjs(onDuty))) {
      if (model.desired_on_duty) {
        model.addError('desired_on_duty', 'The on duty time is after the off duty time.');
      }
      if (model.desired_off_duty) {
        model.addError('desired_off_duty', 'The off duty time is before the on duty time.');
      }
      return;
    }

    if (model._changes['desired_position_id']
      || model._changes['desired_on_duty']
      || model._changes['desired_off_duty']) {
      this.shiftManage.checkDateTime(positionId, onDuty, offDuty, () => this._performSave(model))
    } else {
      this._performSave(model);
    }
  }

  async _performSave(model) {
    try {
      model.review_status = STATUS_PENDING;
      await model.save();
      this.entry.additional_notes = null;
      this.entry = null;
      this.args.onUpdate?.();
      this.toast.success('Your correction note has been submitted.');
    } catch (response) {
      this.house.handleErrorResponse(response);
    }
  }

  // Cancel out the correction request - i.e. hide the form
  @action
  cancelCorrectionAction() {
    this.entry = null;
  }

  timesheetEntryHeaderClass(ts) {
    if (ts.stillOnDuty) {
      return 'text-danger';
    }

    if (ts.isVerified) {
      return 'text-success'
    }

    if (ts.isUnverified) {
      return 'text-bg-warning';
    }

    if (ts.isApproved) {
      return 'text-bg-danger';
    }

    if (ts.isRejected) {
      return 'text-bg-secondary';
    }

    if (ts.isPending) {
      return 'text-bg-secondary';
    }

    return ''
  }

  get havePaidEntries() {
    return !!this.args.timesheets.find((p) => !isEmpty(p.position.paycode));
  }
}
