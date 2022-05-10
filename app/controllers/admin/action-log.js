import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import EmberObject, {set, setProperties} from '@ember/object';
import {action} from '@ember/object';
import {debounce} from '@ember/runloop';
import RSVP from 'rsvp';

const EventOptions = [
  ['BMID Changes', 'bmid-%'],
  ['Client Routing', 'client-route'],
  ['Login Failures', 'auth-failed'],
  ['Email Bounces/Complaints', 'email-%'],
  ['Logins', 'auth-login'],
  ['Password Resets', 'auth-password-%'],
  ['Person Creation', 'person-create'],
  ['Person Update', 'person-update'],
  // Can't use position-% because it will match the position-credit-* events
  ['Position Changes', 'position-create,position-update,position-delete'],
  ['Position Grant/Revokes', 'person-position-%'],
  ['Role Grant/Revokes', 'person-role-%'],
  ['Schedule Updates', 'person-slot-%'],
  ['Setting Changes', 'setting-%'],
  ['Slot Changes', 'slot-%'],
  ['Status Changes', 'person-status-change'],
  ['Ticketing Changes', 'access-document-%']
];

const SortOptions = [
  ['Descending', 'desc'],
  ['Ascending', 'asc']
];

export default class AdminActionLogController extends ClubhouseController {
  queryParams = ['person', 'start_time', 'end_time', 'events', 'sort', 'page'];

  eventOptions = EventOptions;
  sortOptions = SortOptions;

  @action
  toggleLog(log) {
    set(log, 'showing', !log.showing);
  }

  @action
  goNextPage() {
    set(this, 'page', +this.currentPage + 1);
  }

  @action
  goPrevPage() {
    set(this, 'page', +this.currentPage - 1);
  }

  _performSearch(callsign, resolve, reject) {
    callsign = callsign.trim();

    if (callsign.match(/^\d+/)) {
      return resolve([callsign]);
    }

    if (callsign.length < 2) {
      return reject();
    }

    return this.ajax.request('callsigns', { data: {query: callsign, type: 'all', limit: 20} })
      .then(({callsigns}) => resolve(callsigns.map(row => row.callsign)), reject);
  }

  @action
  searchCallsignAction(callsign) {
    return new RSVP.Promise((resolve, reject) => {
      debounce(this, this._performSearch, callsign, resolve, reject, 350);
    });
  }

  @action
  resetFilters() {
    set(this, 'query', EmberObject.create({sort: 'desc'}));
  }

  @action
  searchAction() {
    const params = {};
    console.log('CALLED SEARCH');
    this.queryParams.forEach((param) => {
      if (this.query[param]) {
        if (params === 'events') {
          params[param] = this.query.events.join(',');
        } else {
          params[param] = this.query[param];
        }
      } else {
        params[param] = null;
      }
    });
    params.page = null;
    setProperties(this, params); // Boom! Force route to reload
  }
}
