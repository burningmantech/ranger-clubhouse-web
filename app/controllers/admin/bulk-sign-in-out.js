import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {isEmpty} from '@ember/utils';
import {tracked} from '@glimmer/tracking';

export default class AdminBulkSignInOutController extends ClubhouseController {
  bulkForm = null;  // Setup in route

  @tracked committed = false;
  @tracked haveError = false;
  @tracked entries = [];
  @tracked isSubmitting = false;
  @tracked showHelp = false;

  @tracked errorCount = 0;

  @action
  _sendSigninOuts(commit) {
    const lines = this.bulkForm.lines;

    this.committed = false;
    const data = {lines};

    if (commit) {
      data.commit = 1;
    }

    this.isSubmitting = true;
    this.ajax.post('timesheet/bulk-sign-in-out', {data}).then((result) => {
      this.house.scrollToTop();
      this.haveError = result.status === 'error';
      this.entries = result.entries;
      if (commit && !this.haveError) {
        this.committed = true;
        this.bulkForm.set('lines', '');
      }
      let errors = 0;
      this.entries.forEach((entry) => {
        if (!isEmpty(entry.errors)) {
          errors += entry.errors.length;
        }
      });
      this.errorCount = errors;

    })
      .catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isSubmitting = false)
  }

  @action
  commitAction() {
    this._sendSigninOuts(true);
  }

  @action
  verifyAction() {
    this._sendSigninOuts(false);
  }

  @action
  toggleHelp() {
    this.showHelp = !this.showHelp;
  }
}
