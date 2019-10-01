import Controller from '@ember/controller';
import { action, computed } from '@ember/object';

export default class MeTimesheetCorrectionsController extends Controller {
  showReviewSteps = false;

  @computed('timesheets.@each.isUnverified')
  get unverifiedCount() {
    return this.timesheets.reduce((total, ts) => total + (ts.isUnverified ? 1 : 0), 0);
  }

  @computed('timesheets.@each.isPendingReview')
  get correctionPendingReviewCount() {
    return this.timesheets.reduce((total, ts) => total + (ts.isPendingReview ? 1 : 0), 0);
  }

  @computed('timesheetsMissing.@each.isPending')
  get missingPendingReviewCount() {
    return this.timesheetsMissing.reduce((total, ts) => total + (ts.isPending ? 1 : 0), 0);
  }

  @action
  showReviewAction() {
    this.set('showReviewSteps', true);
  }

}
