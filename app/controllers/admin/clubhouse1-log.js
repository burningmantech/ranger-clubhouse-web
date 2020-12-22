import Controller from '@ember/controller';
import EmberObject, {set, setProperties} from '@ember/object';
import {action} from '@ember/object';
import {debounce} from '@ember/runloop';
import RSVP from 'rsvp';

const EventOptions = [
  ['Email Events', 'email'],
  ['Email Failures', 'emailfail'],
  ['Password Events', 'password'],
  ['Insufficient Role', 'role'],
  ['Login/Logout', 'login'],
  ['Login Failure', 'loginfail'],
  ['Invalid Input', 'invalid'],
  ['General Errors', 'error'],
  ['Fatal Events', 'fatal'],
  ['SQL Log', 'sql'],
  ['Database Errors', 'db'],
  ['Requests', 'request']
];

const SortOptions = [
  ['Descending', 'desc'],
  ['Ascending', 'asc']
];

export default class AdminActionLogController extends Controller {
  queryParams = ['person', 'start_time', 'end_time', 'events', 'sort', 'page', 'event_text'];

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

  _performSearch(query, resolve, reject) {
    if (query.match(/^\d+/)) {
      return resolve([query]);
    }

    return this.ajax.request('callsigns', {data: {query, type: 'all', limit: 20}})
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
    set(this, 'query', EmberObject.create({sort: 'desc'}));
  }

  @action
  searchAction() {
    const params = {};

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
    setProperties(this, params);
    this.toast.clear();
  }
}
