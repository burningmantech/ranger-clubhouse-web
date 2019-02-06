import Controller from '@ember/controller';
import { action, computed } from '@ember-decorators/object';
import { isEmpty } from '@ember/utils';

export default class AdminBulkUploadController extends Controller {
  uploadOptions = [
    {
      groupName: 'Change Status',
      options: [
        'active',
        'alpha',
        'inactive',
        'prospective',
        'prospective waitlist',
        'retired',
        { id: 'vintage', title: 'set vintage flag' }
      ]
    },
    {
      groupName: 'BMID Actions',
      options: [
        { id: 'meals', title: 'Set meals'},
        { id: 'showers', title: 'Set showers'},
        { id: 'bmidsubmitted', title: 'Mark as submitted' }
      ]
    },
    {
      groupName: 'Ticket Actions',
      options: [
        { id: 'tickets', title: 'Create Access Documents' },
        { id: 'wap', title: 'Update WAP dates' },
      ]
    },
    {
      groupName: 'Other',
      options: [
        { id: 'eventradio', title: 'Event radio eligibility' }
      ]
    }
  ];

  uploadAction = null;
  commit = false;
  records = '';
  actionResults = [];

  @computed('uploadAction', 'records')
  get disableSubmit() {
    return isEmpty(this.uploadAction) || isEmpty(this.records);
  }

  @computed('actionResults')
  get resultSuccesses() {
    return this.actionResults.filter((r) => (r.status == 'success'));
  }

  @computed('actionResults')
  get resultFailures() {
    return this.actionResults.filter((r) => (r.status != 'success'));
  }

  @action
  submitAction() {
    this.toast.clear();

    this.set('isSubmitting', true);
    this.set('actionResults', []);
    this.ajax.request('bulk-upload', {
      method: 'POST',
      data: {
        action: this.uploadAction,
        records: this.records,
        commit: this.commit
      }
    }).then((results) => {
      this.set('actionResults', results.results);
      this.set('resultsCommitted', results.commit);
      this.set('commit', false);
      // Clear out the textarea if commited and was successful
      // otherwise leave it in place so editing can be done.
      if (results.commit && this.resultFailures.length == 0) {
        this.set('records', '');
      }
    }).catch((response) => this.house.handleErrorResponse(response))
    .finally(() => this.set('isSubmitting', false));
  }
}
