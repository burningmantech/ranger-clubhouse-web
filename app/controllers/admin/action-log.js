import Controller from '@ember/controller';
import EmberObject, { set } from '@ember/object';
import { action } from '@ember-decorators/object';
import { debounce } from '@ember/runloop';
import RSVP from 'rsvp';

const EventOptions = [
    [ 'Login', 'auth-login' ],
    [ 'Login Failures', 'auth-failed' ],
    [ 'Password Resets', 'auth-password-%' ],
    [ 'Person Update', 'person-update' ],
    [ 'Person Creation', 'person-create' ],
    [ 'Person Creation Fails', 'person-create-fail' ],
    [ 'Schedule Updates', 'person-slot-%' ],
    [ 'Role Updates', 'person-role-%' ],
    [ 'Position Updates', 'person-position-%' ],
];

const SortOptions = [
  [ 'Descending', 'desc' ],
  [ 'Ascending', 'asc' ]
];

export default class AdminActionLogController extends Controller {
  query = EmberObject.create({ sort: 'desc' });

  eventOptions = EventOptions;
  sortOptions = SortOptions;

  @action
  toggleLog(log) {
    set(log, 'showing', !log.showing);
  }

  @action
  goNextPage() {
    this.set('page', this.page + 1);
    this._searchLogs();
  }

  @action
  goPrevPage() {
    this.set('page', this.page - 1);
    this._searchLogs();
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
  searchAction() {
    this._searchLogs();
  }

  @action
  resetFilters() {
    this.set('query', EmberObject.create({ sort: 'desc' }));
  }

  _searchLogs() {
    const params = {
      ...this.query,
      page: this.page,
    };

    this.toast.clear();
    this.set('isSubmitting', true);
    this.ajax.request('action-log', { data: params })
      .then((results) => {
        this.setProperties(results);
        this.set('noResults', !results.logs.length);
      })
      .catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.set('isSubmitting', false));
  }
}
