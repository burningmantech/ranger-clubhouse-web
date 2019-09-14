import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default class ReportsTimesheetCorrectionRequestsController extends Controller {
  queryParams = [ 'year' ];

  @computed('requests')
  get groupedCorrections() {
    const groups = [];

    if (this.requests == null) {
      return groups;
    }

    this.requests.forEach((request) => {
      const value = request.person.callsign;
      let group = groups.findBy('callsign', value);

      if (group) {
        group.requests.push(request);
      } else {
        groups.push({callsign: value, requests: [ request ]});
      }
    });

    return groups;
  }

  @computed('groupedCorrections')
  get letterOptions() {
    let letters = {};
    this.groupedCorrections.forEach((group) => {
        letters[group.callsign.charAt(0).toUpperCase()] = 1;
    });

    letters = Object.keys(letters).sort();
    letters.unshift('All');

    return letters;
  }

  @computed('groupedCorrections', 'callsignFilter')
  get viewGroupCorrections() {
    const requests = this.groupedCorrections;
    const filter = this.callsignFilter;

    if (filter == 'All') {
      return requests;
    }

    return requests.filter((group) => (group.callsign.charAt(0).toUpperCase() == filter));
  }
}
