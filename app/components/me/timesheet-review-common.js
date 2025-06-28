import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {isEmpty} from '@ember/utils';
import {STATUS_VERIFIED} from "clubhouse/models/timesheet";
import currentYear from 'clubhouse/utils/current-year';

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
  }

  @action
  savedEntry() {
    this.entry = null;
    this.args.onUpdate?.();
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
      return 'text-bg-success'
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
      return 'text-bg-warning';
    }

    return ''
  }

  get havePaidEntries() {
    return !!this.args.timesheets.find((p) => !isEmpty(p.position.paycode));
  }
}
