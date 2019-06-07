import Controller from '@ember/controller';
import { action, computed } from '@ember/object';
import EmberObject from '@ember/object';
import { Role } from 'clubhouse/constants/roles';
import { debounce, run } from '@ember/runloop';
import ENV from 'clubhouse/config/environment';
import RSVP from 'rsvp';

import $ from 'jquery';

const ENTER = 13;
const F1 = 112;
/*const F2 = 113;
const F3 = 114;
const ESC = 27;
*/

// How often in milliseconds should a search be performed as
// the user is typing.
const SEARCH_RATE_MS = 300;

const SearchFields = ['name', 'callsign', 'email', 'formerly_known_as'];

// Statuses to automatically exclude, unless included
const ExcludeStatus = ['auditor', 'past prospective'];

export default class ApplicationController extends Controller {
  init() {
    super.init(...arguments);
    /*
     * Bind the keyup event on the body element to intercept the user's
     * typing so ESC to as shortcuts to the search page.
     */

    $('body').bind('keyup', (event) => { // eslint-disable-line ember/jquery-ember-run
      if (!(event.shiftKey && event.keyCode == F1)) {
        return true;
      }

      event.preventDefault(); // eslint-disable-line ember/jquery-ember-run

      run.schedule('afterRender', () => {
        $('#person-search-query input').focus();
      });

      return false;
    });
  }

  setup() {
    // Call from setCurrentUser in route after user has been authenticated
    this.set('searchForm', EmberObject.create({
      query: '',
      name: true,
      callsign: true,
      email: true,
      formerly_known_as: true,

      auditor: false,
      past_prospective: false,

      mode: (this.session.user.is_on_duty_at_hq) ? 'hq' : 'account',
    }));
  }

  isSubmitting = false;
  showFKA = false;

  searchForm = {};

  @action
  searchFormChange() {
    this.house.setKey('person-search-prefs', this.searchForm);
  }

  /*
   * Called from route/application when the user is logged in.
   */

  @computed('session.user.roles')
  get canAccountManage() {
    if (this.session.user) {
      return this.session.user.hasRole([Role.ADMIN, Role.MANAGE, Role.VIEW_PII, Role.VC, Role.TRAINER, Role.MENTOR, Role.TIMESHEET_MANAGER]);
    } else {
      return false;
    }
  }

  @computed('session.user.{is_on_duty_at_hq,has_hq_window}')
  get modeOptions() {
    const user = this.session.user;
    const options = [ { id: 'account', title: 'Person Manage' } ];

    if (user.has_hq_window) {
      options.push({ id: 'hq', title: 'HQ Window' });
    }

    if (user.hasRole([Role.ADMIN, Role.TIMESHEET_MANAGER])) {
      options.push({ id: 'timesheet', title: 'Timesheet Manage' });
    }

    return options;
  }

  @computed('session.user.roles')
  get canViewEmail() {
    return this.session.user.hasRole([Role.ADMIN, Role.VIEW_PII, Role.VIEW_EMAIL]);
  }

  /*
   * Transition to the selected person. Clear the query and results, blur
   * the input field
   */

   _modeRoutes = {
     'account':   'person.index',
     'hq':        'hq.index',
     'timesheet': 'hq.timesheet'
   };

  _showPerson(person) {
      const mode = this.searchForm.mode;

      this.set('showSearchOptions', false);
      this.set('query', '');
      this.set('enterPressed', false);
      this.transitionToRoute((this._modeRoutes[mode] || 'person.index'), person.id);
      $('#person-search-query input').blur();
  }

  @action
  defaultHighlightedAction() {
    // prevent the first object from automatically being selected.
    return undefined;
  }

  /*
   * Show the person when the user clicks on an option.
   */

  @action
  searchChangeAction(person) {
    if (person) {
      this._showPerson(person);
    }
  }

  /*
   * As the user types, searchAction will be called. Queue up
   * the search once every SEARCH_RATE_MS milliseconds.
   *
   */

  @action
  searchAction(query, powerSelect) {
    return new RSVP.Promise((resolve, reject) => {
      debounce(this, this._performSearch, [ query, powerSelect ], resolve, reject, SEARCH_RATE_MS);
    });
  }

  /*
   * Search for the person
   */

  _performSearch([ callsign, powerSelect ], resolve, reject) {
    const query = callsign.trim();
    const form = this.searchForm;

    // query has to be two characters or more..
    if (query.length < 2) {
      return reject();
    }

    // Person id lookup
    if (query.startsWith('+')) {
      const id = query.substring(1, query.length);
      const results = [ {
        callsign: `Person #${id}`,
        id,
        email: '-',
        first_name: '-',
        last_name: '-'
      }];
      this.set('searchResults', results);
      return resolve(results);
    }

    const params = {
      basic: 1,
      query
    };

    if (form.mode == 'hq') {
      // restrict search to callsign and a handful of active-like statuses
      params.search_fields = 'callsign';
      params.statuses = 'active,alpha,prospective,retired,non ranger,inactive';
    } else {
      // Find out which fields to search
      const search_fields = [];
      SearchFields.forEach((field) => {
        if (form[field]) {
          search_fields.push(field);
        }
      });

      if (search_fields.length > 0) {
        params.search_fields = search_fields.join(',');
      }

      // By default, certain status are exclude.
      // The take status off the list if the user wants
      // those included
      const toExclude = ExcludeStatus.slice();

      if (form.auditor) {
        toExclude.removeObject('auditor');
      }

      if (form.past_prospective) {
        toExclude.removeObject('past prospective');
      }

      if (toExclude.length > 0) {
        params.exclude_statuses = toExclude.join(',');
      }
    }

    // And fire away!
    return this.ajax.request('person', {
      data: params
    }).then((results) => {
      const people = results.person;

      if (this.enterPressed && people && people.length == 1) {
        /*
         * Allow EPS to render the list, and then choose the item.
         * EPS will tend 'blur' correctly by removing the results box.
         */
        setTimeout(() => {
          run.schedule('afterRender', () => {
            powerSelect.actions.choose(people.firstObject);
          });
        }, 50);
      }

      this.set('searchResults', people);
      return resolve(people);
    }).catch((response) => {
      this.house.handleErrorResponse(response)
      return reject();
    });
  }

  /*
   * When the user hits enter, see if one and only one result
   * was found, and route over to that person
   */

  @action
  submit() {
/*    const results = this.searchResults;
    if (!results || results.length != 1) {
      return;
    }

    this._showPerson(results.firstObject);*/
  }

  @action
  searchKeydownAction(powerSelect, event) {
    if (event.keyCode === ENTER) {
      event.preventDefault();

      if (this.searchResults && this.searchResults.length == 1) {
        powerSelect.actions.choose(this.searchResults.firstObject);
        return false;
      }
      this.set('enterPressed', true);
    } else {
      this.set('enterPressed', false);
    }

    return true;
  }

  @action
  searchFocusAction() {
    this.set('searchResults', null);
    this.set('showSearchOptions', (this.searchForm.mode != 'hq'));
    this.set('enterPressed', false);
  }

  @action
  hideSearchBoxAction() {
    this.set('showSearchOptions', false);
  }

  @computed('searchForm.{name,callsign,email,formerly_known_as,mode}')
  get searchPlaceholder() {
    const form = this.searchForm;

    const fields = [];

    if (form.mode == 'hq') {
      fields.push('callsign');
    } else {
      if (form.callsign) {
        fields.push('callsign');
      }

      if (form.name) {
        fields.push('name');
      }

      if (form.email) {
        fields.push('email');
      }

      if (form.formerly_known_as) {
        fields.push('fka');
      }
    }

    const arrayToSentence = (a, conjunction) => [a.slice(0, -1).join(', '), a.pop()].filter(w => w !== '').join(` ${conjunction} `);

    return `Enter a ${arrayToSentence(fields, 'or')} to search`;
  }

  @computed('ENV')
  get applicationVersion() {
    return ENV.APP.version;
  }

  @computed('ENV')
  get buildTimestamp() {
    return ENV.APP.buildTimestamp;
  }

}
