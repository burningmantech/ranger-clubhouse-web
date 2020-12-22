import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class MeTimesheetCorrectionsController extends Controller {
  @tracked showReviewSteps = false;

  get unverifiedCount() {
    return this.timesheets.reduce((total, ts) => total + (ts.isUnverified ? 1 : 0), 0);
  }

  get correctionPendingReviewCount() {
    return this.timesheets.reduce((total, ts) => total + (ts.isPending ? 1 : 0), 0);
  }

  get missingPendingReviewCount() {
    return this.timesheetsMissing.reduce((total, ts) => total + (ts.isPending ? 1 : 0), 0);
  }

  @action
  showReviewAction() {
    this.showReviewSteps = true;
  }
}
