import Controller from '@ember/controller';
import { action, computed } from '@ember-decorators/object';

export default class ReportsTimesheetCorrectionRequestsController extends Controller {
  queryParams = [ 'year' ];

  @computed('corrections')
  get groupedCorrections() {
    const groups = [];

    if (this.corrections == null) {
      return groups;
    }

    this.corrections.forEach((correction) => {
      const value = correction.person.callsign;
      let group = groups.findBy('callsign', value);

      if (group) {
        group.requests.push(correction);
      } else {
        groups.push({callsign: value, requests: [ correction ]});
      }
    });

    return groups;
  }

  @action
  changeYear(year) {
    this.set('year', year);
  }
}
