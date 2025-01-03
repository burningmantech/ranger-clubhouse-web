import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import EmberObject from '@ember/object';
import {action} from '@ember/object';
import {debounce} from '@ember/runloop';
import RSVP from 'rsvp';
import {tracked} from '@glimmer/tracking';
import _ from 'lodash';


const SortOptions = [
  ['Descending', 'desc'],
  ['Ascending', 'asc']
];

export default class AdminRequestLogController extends ClubhouseController {
  queryParams = ['person', 'start_time', 'end_time', 'sort', 'page'];

  sortOptions = SortOptions;

  @tracked person;
  @tracked start_time;
  @tracked end_time;
  @tracked events;
  @tracked sort;
  @tracked page;

  @tracked query;

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
    this.query = EmberObject.create({sort: 'desc'});
  }

  @action
  searchAction() {
    this.queryParams.forEach((param) => {
      if (!_.isEmpty(this.query[param])) {
        this[param] = this.query[param];
      } else {
        this[param] = null;
      }
    });
    this.page = null;
  }

  @action
  expireLog() {
    this.modal.confirm('Expire Logs', 'Every night a background task will automatically expire the log. Are you sure you wish to expire records older than 7 days?', async () => {
      try {
        await this.ajax.request('request-log/expire', {method: 'DELETE'});
        this.toast.success('Log expired successfully');
        this.send('refreshRoute');
      } catch (response) {
        this.house.handleErrorResponse(response);
      }
    });
  }
}
