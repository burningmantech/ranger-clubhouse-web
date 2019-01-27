import Controller from '@ember/controller';
import { action, computed } from '@ember-decorators/object';
import EmberObject from '@ember/object';
import { Role } from 'clubhouse/constants/roles';
import { debounce, run } from '@ember/runloop';
import RSVP from 'rsvp';

import $ from 'jquery';

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

      run( () => {
        $('#person-search-query input').focus();
      });

      return false;
    });
  }

  isSubmitting = false;
  showFKA = false;

  searchForm = EmberObject.create({
    query: '',

    name: true,
    callsign: true,
    email: true,
    formerly_known_as: false,

    auditor: false,
    past_prospective: false,
  });

  @computed('session.user.roles')
  get displayModeOptions() {
    const user = this.session.user;
    const options = [];

    if (user.hasRole([Role.ADMIN, Role.VIEW_PII, Role.VC, Role.TRAINER, Role.MENTOR])) {
      options.push({
        id: 'full',
        title: 'Account Manage'
      });
    }

    options.push({
      id: 'hq',
      title: 'HQ Window'
    });

    if (user.hasRole(Role.TIMESHEET_MANAGER)) {
      options.push({
        id: 'timesheet',
        title: 'Timesheet Management'
      });
    }

    return options;
  }

  @computed('session.user.roles')
  get canViewEmail() {
    return this.session.user.hasRole([Role.ADMIN, Role.VIEW_PII, Role.VIEW_EMAIL]);
  }

  @action
  searchAction(query) {
    return new RSVP.Promise((resolve, reject) => {
      debounce(this, this._performSearch, query, resolve, reject, SEARCH_RATE_MS);
    });
  }

  _showPerson(person) {
    if (!person) {
      return;
    }

    this.set('showSearchBox', false);
    this.set('query', '');
    this.transitionToRoute('person.index', person.id);
    $('#person-search-query input').blur();
  }

  // Build up a request and fire off a search
  _performSearch(callsign, resolve, reject) {
    const query = callsign.trim();
    const form = this.searchForm;

    // bail out if query is empty, or if doing search by record id
    if (query == '' || query.startsWith('+') || query.length < 2) {
      return reject();
    }

    const params = {
      basic: 1,
      query
    };

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

    // And fire away!
    this.set('isSubmitting', true);
    this.ajax.request('person', {
        data: params
      }).then((results) => {
        return resolve(results.person);
      }).catch((response) => {
        this.house.handleErrorResponse(response)
        return reject();
      })
      .finally(() => this.set('isSubmitting', false));
  }

  // When the user hits enter, see if one and only one result
  // was found, and route over to that person
  @action
  submit() {
    const query = this.searchForm.get('query');

    if (query.startsWith('+')) {
      this.set('showSearchBox', false);
      this.transitionToRoute('person.index', query.slice(1));
      return;
    }

    const results = this.searchResults;
    if (!results || results.length != 1) {
      return;
    }

    this._showPerson(results.firstObject);
  }

  @action
  searchFocusAction() {
    this.set('showSearchBox', true);
  }

  @action
  hideSearchBoxAction() {
    this.set('showSearchBox', false);
  }

  @action
  searchChangeAction(person) {
    this._showPerson(person);
  }

  @computed('searchForm.{name,callsign,email,formerly_known_as}')
  get searchPlaceholder() {
    const form = this.searchForm;

    const fields = [];

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

    const arrayToSentence = (a, conjunction) => [a.slice(0, -1).join(', '), a.pop()].filter(w => w !== '').join(` ${conjunction} `);

    return `Enter a ${arrayToSentence(fields, 'or')} to search`;
  }

}
