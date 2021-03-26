import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {isEmpty} from '@ember/utils';
import {tracked} from '@glimmer/tracking';

export default class AdminBulkUploadController extends ClubhouseController {
  uploadOptions = [
    {
      groupName: 'Change Status',
      options: [
        'active',
        'alpha',
        'inactive',
        'prospective',
        'retired',
        {id: 'vintage', title: 'set vintage flag'}
      ]
    },
    {
      groupName: 'BMID & Radio Actions',
      options: [
        {id: 'meals', title: 'Set meals'},
        {id: 'showers', title: 'Set showers'},
        {id: 'bmidsubmitted', title: 'Mark BMID as submitted'},
        {id: 'eventradio', title: 'Event radio eligibility'}
      ]
    },
    {
      groupName: 'Ticket Actions',
      options: [
        {id: 'tickets', title: 'Create Access Documents'},
        {id: 'wap', title: 'Update WAP dates'},
      ]
    },
    {
      groupName: 'Vehicle Paperwork Flags',
      options: [
        {id: 'signed_motorpool_agreement', title: 'Signed Motorpool Agreement (gators/golf carts)'},
        {id: 'org_vehicle_insurance', title: 'Has Org Vehicle Insurance (MVR)'},
        {id: 'may_request_stickers', title: 'May Request Vehicle Use Items'},
      ]
    },
    {
      groupName: 'OSHA Certification',
      options: [
        {id: 'osha10', title: 'Mark as OSHA-10 certified'},
        {id: 'osha30', title: 'Mark as OSHA-30 certified'}
      ]
    },
    {
      groupName: 'Affidavits',
      options: [
        {id: 'sandman_affidavit', title: 'Sandman Affidavit'}
      ]
    }
  ];

  @tracked uploadAction = null;
  @tracked commit = false;
  @tracked records = '';
  @tracked actionResults = [];
  @tracked isSubmitting = false;
  @tracked isCommitting = false;
  @tracked resultsCommitted = false;

  @tracked resultSuccesses = null;
  @tracked resultFailures = null;

  get disableSubmit() {
    return isEmpty(this.uploadAction) || isEmpty(this.records);
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
      this.resultFailures = this.actionResults.filter((r) => (r.status !== 'success'));

      // Clear out the textarea if commited and was successful
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
}
