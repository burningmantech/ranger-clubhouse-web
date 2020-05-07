import Controller from '@ember/controller';
import {action, computed} from '@ember/object';
import {isEmpty} from '@ember/utils';
import {tracked} from '@glimmer/tracking';

export default class AdminBulkSignInOutController extends Controller {
  bulkForm = null;  // Setup in route
  @tracked committed = false;
  @tracked haveError = false;
  @tracked entries = [];
  @tracked isSubmitting = false;
  @tracked showHelp = false;

  @computed('entries.@each.errors')
  get errorCount() {
    let errors = 0;

    this.entries.forEach((entry) => {
      if (!isEmpty(entry.errors)) {
        errors += entry.errors.length;
      }
    });

    return errors;
  }

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
      this.haveError = result.status == 'error';
      this.entries = result.entries;
      if (commit && !this.haveError) {
        this.committed = true;
        this.bulkForm.set('lines', '');
      }
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
