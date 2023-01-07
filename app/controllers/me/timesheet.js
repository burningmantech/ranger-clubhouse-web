import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from "@ember/object";
import {cached, tracked} from '@glimmer/tracking';
import countIf from "clubhouse/utils/count-if";

export default class MeTimesheetController extends ClubhouseController {
  queryParams = ['year'];

  @tracked person;

  @tracked entry;
  @tracked isSubmitting = false;
  @tracked positions;

  @tracked timesheetInfo;
  @tracked timesheetSummary;
  @tracked timesheets;
  @tracked timesheetsMissing;

  @tracked showFinalConfirmation = false;
  @tracked finalConfirmation = false;
  @tracked confirmedAt;

  @tracked askIfDone = false;

  @tracked isCurrentYear;


  @cached
  get unverifiedCount() {
    return countIf(this.timesheets, (ts) => ts.isUnverified) +
      (this.timesheets.find((ts) => !ts.off_duty) ? 1 : 0);
  }

  @cached
  get correctionPendingReviewCount() {
    return countIf(this.timesheets, (ts) => ts.isPending);
  }

  @cached
  get missingPendingReviewCount() {
    return countIf(this.timesheetsMissing, (ts) => ts.isPending);
  }

  get haveOutstandingTasks() {
    return this.unverifiedCount || this.correctionPendingReviewCount || this.missingPendingReviewCount;
  }

  get correctionsEnabled() {
    return this.isCurrentYear && this.timesheetInfo.correction_enabled;
  }

  @action
  onEntryUpdate() {
    this.finalConfirmation = false;
  }

  @action
  onEntryVerify() {
    if (this.haveOutstandingTasks) {
      return;
    }

    this.askIfDone = true;
  }

  @action
  isDoneAction() {
    this.askIfDone = false;
    this.showFinalConfirmation = true;
  }

  @action
  cancelAskIfDone() {
    this.askIfDone = false;
  }

  @action
  showFinalConfirmationAction() {
    this.showFinalConfirmation = true;
  }

  @action
  cancelFinalConfirmationAction() {
    this.showFinalConfirmation = false;
  }

  @action
  confirmAction() {
    this.isSubmitting = true;

    this.ajax.request(`timesheet/confirm`, {
      method: 'POST',
      data: {person_id: this.session.userId, confirmed: 1}
    }).then(({confirm_info}) => {
      // Update the confirmed results
      this.finalConfirmation = confirm_info.timesheet_confirmed;
      this.confirmedAt = confirm_info.timesheet_confirmed_at;
      this.showFinalConfirmation = false;
      this.toast.success(`Your timesheet has been marked as CONFIRMED.`);
      window.scrollTo(0, 0);
    }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isSubmitting = false);
  }
}
