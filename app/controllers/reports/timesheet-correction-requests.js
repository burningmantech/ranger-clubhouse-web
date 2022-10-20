import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { tracked } from '@glimmer/tracking';

export default class ReportsTimesheetCorrectionRequestsController extends ClubhouseController {
  queryParams = [ 'year' ];

  @tracked requests;
  @tracked callsignFilter = '';

  get groupedCorrections() {
    const groups = [];

    if (this.requests == null) {
      return groups;
    }

    this.requests.forEach((request) => {
      const value = request.person.callsign;
      let group = groups.find((g) => g.callsign === value);

      if (group) {
        group.requests.push(request);
      } else {
        groups.push({callsign: value, requests: [ request ]});
      }
    });

    return groups;
  }

  get letterOptions() {
    let letters = {};
    this.groupedCorrections.forEach((group) => {
        letters[group.callsign.charAt(0).toUpperCase()] = 1;
    });

    letters = Object.keys(letters).sort();
    letters.unshift('All');

    return letters;
  }

  get viewGroupCorrections() {
    const requests = this.groupedCorrections;
    const filter = this.callsignFilter;

    if (filter === 'All') {
      return requests;
    }

    return requests.filter((group) => (group.callsign.charAt(0).toUpperCase() === filter));
  }
}
