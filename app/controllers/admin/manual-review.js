import Controller from '@ember/controller';
import { action, computed } from '@ember/object';
import _ from 'lodash';

export default class AdminManualReviewController extends Controller {
  queryParams = [ 'year' ];

  @computed('manual_review')
  get summary() {
      return _.sortBy(_.map(_.groupBy(this.manual_review, (row) => row.person.status), (group, status) => {
        return {
          status,
          count: group.length
        }
      }), 'status');
  }

  @computed('manual_review')
  get pnvList() {
    return this.manual_review.filter((row) => (row.person.status == 'prospective' || row.person.status == 'alpha'))
        .sort((a,b) => (b.passdate < a.passdate ? -1 : (b.passdate > a.passdate ? 1 : 0)));
  }

  @computed('spreadsheet')
  get spreadsheetErrors() {
    return this.spreadsheet.filter((row) => row.errors);
  }

  @action
  togglePNVs() {
    this.set('showPNVs', !this.showPNVs);
  }
  @action
  toggleAll() {
    this.set('showAll', !this.showAll);
  }

  @action
  importManualReview() {
    this.set('isSubmitting', true);
    this.ajax.request('manual-review/import').then(() => {
      this.toast.success('The Manual Review spreadsheet was succesfully imported.');
    }).catch((response) => this.house.handleErrorResponse(response))
    .finally(() => this.set('isSubmitting', false));
  }

  @action
  retrieveRawSpreadsheet() {
    this.set('isSubmitting', true);
    this.ajax.request('manual-review/spreadsheet').then((result) => {
      this.set('spreadsheet', result.spreadsheet);
      this.set('showSpreadsheet', true);
    }).catch((response) => this.house.handleErrorResponse(response))
    .finally(() => this.set('isSubmitting', false));
  }
}
