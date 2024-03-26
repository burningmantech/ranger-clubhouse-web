import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import EmberObject, {set} from '@ember/object';
import {action} from '@ember/object';
import {debounce} from '@ember/runloop';
import RSVP from 'rsvp';
import {tracked} from '@glimmer/tracking';
import _ from 'lodash';

const EventOptions = [
  ['Agreement Signatures', 'agreement-signature'],
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
  ['Position Manual Grant/Revokes', 'person-position-%'],
  ['Role Manual Grant/Revokes', 'person-role-%'],
  ['Schedule Updates', 'person-slot-%'],
  ['Setting Changes', 'setting-%'],
  ['Slot Changes', 'slot-%'],
  ['Team Updates', 'team-create,team-update,team-destroy'],
  ['Team Role Updates', 'team-role-%'],
  ['Team Grant/Revokes', 'person-team-%'],
  ['Ticketing/Provision Changes', 'access-document-%'],
];

const SortOptions = [
  ['Descending', 'desc'],
  ['Ascending', 'asc']
];

export default class AdminActionLogController extends ClubhouseController {
  queryParams = ['person', 'start_time', 'end_time', 'events', 'sort', 'page', 'event_name', 'message'];

  eventOptions = EventOptions;
  sortOptions = SortOptions;

  @tracked person;
  @tracked start_time;
  @tracked end_time;
  @tracked events;
  @tracked sort;
  @tracked page;
  @tracked event_name;
  @tracked message;

  @tracked query;

  @action
  toggleLog(log) {
    set(log, 'showing', !log.showing);
  }

  @action
  goNextPage() {
    this.page = +this.currentPage + 1;
  }

  @action
  goPrevPage() {
    this.page = +this.currentPage - 1;
  }

  _performSearch(callsign, resolve, reject) {
    callsign = callsign.trim();

    if (callsign.match(/^\d+/)) {
      return resolve([callsign]);
    }

    if (callsign.length < 2) {
      return reject();
    }

    return this.ajax.request('callsigns', {data: {query: callsign, type: 'all', limit: 20}})
      .then(({callsigns}) => resolve(callsigns.map(row => row.callsign)), reject);
  }

  @action
  async searchCallsignAction(callsign) {
    return new RSVP.Promise((resolve, reject) => {
      debounce(this, this._performSearch, callsign, resolve, reject, 350);
    });
  }

  @action
  resetFilters() {
    this.query =  EmberObject.create({sort: 'desc'});
  }

  @action
  searchAction() {
    const params = {};
    this.queryParams.forEach((param) => {
      if (!_.isEmpty(this.query[param])) {
        if (params === 'events') {
          this[param] = this.query.events.join(',');
        } else {
          this[param] = this.query[param];
        }
      } else {
        this[param] = null;
      }
    });
    this.page = null;
  }
}
