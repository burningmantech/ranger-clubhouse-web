import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {isEmpty} from '@ember/utils';
import {tracked} from '@glimmer/tracking';

import {ALL_EAT_PASS, EVENT_EAT_PASS, WET_SPOT, EVENT_RADIO} from 'clubhouse/models/provision';

const HAS_YEARS = [
  ALL_EAT_PASS, EVENT_EAT_PASS, WET_SPOT, EVENT_RADIO
];

export default class AdminBulkUploadController extends ClubhouseController {
  @tracked uploadAction = null;
  @tracked actionLabel = null;
  @tracked uploadHelp = null;
  @tracked defaultSourceYear;
  @tracked defaultExpiryYear;

  @tracked commit = false;
  @tracked records = '';
  @tracked actionResults = [];
  @tracked isSubmitting = false;
  @tracked isCommitting = false;
  @tracked resultsCommitted = false;

  @tracked resultSuccesses = null;
  @tracked resultWarnings = null;
  @tracked resultFailures = null;


  get disableSubmit() {
    return isEmpty(this.uploadAction) || isEmpty(this.records);
  }

  @action
  selectAction(option) {
    this.uploadAction = option.id;
    this.actionLabel = option.label;
    this.uploadHelp = option.help;
  }

  _submitCallsigns(commit) {
    this.toast.clear();

    this.isSubmitting = true;
    this.isCommitting = commit;
    this.actionResults = [];
    this.ajax.request('bulk-upload', {
      method: 'POST',
      data: {
        action: this.uploadAction,
        records: this.records,
        commit
      }
    }).then((results) => {
      this.actionResults = results.results;
      this.resultsCommitted = results.commit;
      this.commit = false;
      this.resultSuccesses = this.actionResults.filter((r) => (r.status === 'success'));
      this.resultFailures = this.actionResults.filter((r) => (r.status !== 'success' && r.status !== 'warning'));
      this.resultWarnings = this.actionResults.filter((r) => (r.status === 'warning'));

      // Clear out the textarea if the upload was successfully committed
      // otherwise leave it in place so editing can be done.
      if (results.commit) {
        if (!this.resultFailures.length) {
          this.toast.success('Congratulations! The upload was successfully submitted.');
          this.records = '';
        } else {
          this.toast.error('1 or more uploads were not successful.');
        }
      }
    }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => {
        this.isSubmitting = false;
        this.isCommitting = false;
      });
  }

  @action
  submitAction() {
    this._submitCallsigns(false);
  }

  @action
  commitAction() {
    this._submitCallsigns(true);
  }

  get usesTicketDefaultYears() {
    return this.uploadAction === 'tickets';
  }

  get usesProvisionDefaultYears() {
    return HAS_YEARS.includes(this.uploadAction);
  }

}
