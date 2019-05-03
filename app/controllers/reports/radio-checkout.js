import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class ReportsRadioCheckoutController extends Controller {
  queryParams = [ 'year', 'include_qualified', 'event_summary' ];

  @action
  toggleEventSummary() {
    this.set('event_summary', !this.event_summary);
  }

  @action
  toggleIncludeQualified() {
    this.set('include_qualified', !this.include_qualified);
  }
}
