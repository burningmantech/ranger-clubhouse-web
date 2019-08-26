import Controller from '@ember/controller';
import { action, computed } from '@ember/object';
import { isEmpty } from '@ember/utils';

export default class AdminBulkSignInOutController extends Controller {
  bulkForm = null;  // Setup in route
  committed = false;
  haveError = false;
  entries = [];

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

    this.set('committed', false);
    const data = { lines };

    if (commit) {
      data.commit = 1;
    }

    this.set('isSubmitting', true);
    this.ajax.post('timesheet/bulk-sign-in-out', { data }).then((result) => {
      this.house.scrollToTop();
      this.set('haveError', (result.status == 'error'));
      this.set('entries', result.entries);
      if (commit && !this.haveError) {
        this.set('committed', true);
        this.bulkForm.set('lines', '');
      }
    })
    .catch((response) => this.house.handleErrorResponse(response))
    .finally(() => this.set('isSubmitting', false) );
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
    this.set('showHelp', !this.showHelp);
  }
}
