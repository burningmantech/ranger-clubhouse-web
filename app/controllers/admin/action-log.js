import Controller from '@ember/controller';
import EmberObject, { set } from '@ember/object';
import { action } from '@ember/object';
import { debounce } from '@ember/runloop';
import RSVP from 'rsvp';

const EventOptions = [
    [ 'BMID Changes', 'bmid-%' ],
    [ 'Client Routing', 'client-route' ],
    [ 'Login Failures', 'auth-failed' ],
    [ 'Logins', 'auth-login' ],
    [ 'Password Resets', 'auth-password-%' ],
    [ 'Person Creation Fails', 'person-create-fail' ],
    [ 'Person Creation', 'person-create' ],
    [ 'Person Update', 'person-update' ],
    [ 'Position Changes', 'position-%' ],
    [ 'Position Grant/Revokes', 'person-position-%' ],
    [ 'Role Changes', 'person-role-%' ],
    [ 'Schedule Updates', 'person-slot-%' ],
    [ 'Slot Changes', 'slot-%' ],
    [ 'Status Changes', 'person-status-change' ],
    [ 'Ticketing Changes', 'access-document-%' ]
];

const SortOptions = [
  [ 'Descending', 'desc' ],
  [ 'Ascending', 'asc' ]
];

export default class AdminActionLogController extends Controller {
  queryParams = [ 'person', 'start_time', 'end_time', 'events', 'sort', 'page' ];

  eventOptions = EventOptions;
  sortOptions = SortOptions;

  @action
  toggleLog(log) {
    set(log, 'showing', !log.showing);
  }

  @action
  goNextPage() {
    this.set('page', +this.currentPage + 1);
  }

  @action
  goPrevPage() {
    this.set('page', +this.currentPage - 1);
  }

  _performSearch(query, resolve, reject) {
    if (query.match(/^\d+/)) {
      return resolve([ query ]);
    }

    return this.ajax
      .request('callsigns', {
        data: { query, type: 'all', limit: 20 }
      })
      .then((result) => {
        if (result.callsigns.length > 0) {
          return resolve(result.callsigns.map((c) => c.callsign));
        }
        return reject();
      }, reject);
  }

  @action
  searchCallsignAction(callsign) {
    return new RSVP.Promise((resolve, reject) => {
      debounce(this, this._performSearch, callsign, resolve, reject, 350);
    });
  }

  @action
  resetFilters() {
    this.set('query', EmberObject.create({ sort: 'desc' }));
  }

  @action
  searchAction() {
    const params = {};

    this.queryParams.forEach((param) => {
      if (this.query[param]) {
        if (params == 'events') {
          params[param] = this.query.events.join(',');
        } else {
          params[param] = this.query[param];
        }
      } else {
        params[param] = null;
      }
    });
    params.page = null;
    this.setProperties(params); // Boom! Force route to reload
  }
}
