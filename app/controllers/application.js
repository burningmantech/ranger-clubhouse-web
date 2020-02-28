import Controller from '@ember/controller';
import {action, computed} from '@ember/object';
import EmberObject from '@ember/object';
import {Role} from 'clubhouse/constants/roles';
import {debounce, run} from '@ember/runloop';
import {config} from 'clubhouse/utils/config';
import {inject as service} from '@ember/service';
import {inject as controller} from '@ember/controller';

import moment from 'moment';

import ENV from 'clubhouse/config/environment';
import RSVP from 'rsvp';

// How often in milliseconds should a search be performed as
// the user is typing.
const SEARCH_RATE_MS = 300;

const SearchFields = ['name', 'callsign', 'email', 'formerly_known_as'];

// Statuses to automatically exclude, unless included
const ExcludeStatus = ['auditor', 'past prospective'];

export default class ApplicationController extends Controller {
  groundHogDayTime = null;
  groundHogDayTimerId = null;

  @service router;
  @controller('person') personController;
  @controller('hq') hqController;

  constructor() {
    super(...arguments);

    /*
     * Bind the keyup event so when Shift+F1 is pressed, the search bar is focused.
     */
    document.querySelector('body').addEventListener('keyup', (event) => {
      if (!(event.shiftKey && event.key == "F1")) {
        return true;
      }

      event.preventDefault(); // eslint-disable-line ember/jquery-ember-run

      run.schedule('afterRender', () => {
        document.querySelector('#search-bar input').focus();
      });

      return false;
    });

    /*
     * Polyfill canvas.toBlob for IE Edge
     */

    if (!HTMLCanvasElement.prototype.toBlob) {
      Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
        value: function (callback, type, quality) {
          const dataURL = this.toDataURL(type, quality).split(',')[1];
          setTimeout(function () {

            let binStr = atob(dataURL),
              len = binStr.length,
              arr = new Uint8Array(len);

            for (let i = 0; i < len; i++) {
              arr[i] = binStr.charCodeAt(i);
            }

            callback(new Blob([arr], {type: type || 'image/png'}));

          });
        }
      });
    }
  }

  setup() {
    /*
     * Is the server in an groundhog day configuration where science and demonology blend
     * seamlessly together and the entire 1970s decade loops infinitely ?.. err wait, that's Scarfolk.
     * If the the server reported a Ground Hog Day time, show the time in a banner,
     * and update the time on a minute basis. The time may not stay in sync with the backend.
     * That's okay, a groundhog day server is only intended for training.
     */
    if (config('GroundhogDayTime') && !this.groundHogDayTimerId) {
      this.set('groundHogDayTime', moment(config('GroundhogDayTime')));
      this.set('groundHogDayTimerId', setInterval(() => {
        this.set('groundHogDayTime', moment(this.groundHogDayTime).add(1, 's').format('YYYY-MM-DD HH:mm:ss'));
      }, 1000));
    }

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

  searchForm = {};

  /**
   * Save the search prefs when changed. The local store is used so the prefs persist in case the user
   * reloads the page.
   */

  @action
  searchFormChange() {
    this.house.setKey('person-search-prefs', this.searchForm);
  }

  /**
   * Is the user allowed to see the search bar?
   *
   * @returns {boolean}
   */

  @computed('session.user.roles')
  get canAccountManage() {
    if (this.session.user) {
      return this.session.user.hasRole([Role.ADMIN, Role.MANAGE, Role.VIEW_PII, Role.VC, Role.MENTOR, Role.TIMESHEET_MANAGEMENT]);
    } else {
      return false;
    }
  }

  _modeRoutes = {
    'account': 'person.index',
    'hq': 'hq.index',
    'timesheet': 'person.timesheet'
  };

  /**
   * Build up the options for search type
   *
   * account - redirect to Person Manage
   * timesheet - redirect to the person timesheet management page
   * hq - redirect to the HQ Window interface
   *
   * @returns {[{id: search-mode, title: search label}]}
   */

  @computed('session.user.{is_on_duty_at_hq,has_hq_window}')
  get modeOptions() {
    const user = this.session.user;
    const options = [{id: 'account', title: 'Person Manage'}];

    if (user.has_hq_window) {
      options.push({id: 'hq', title: 'HQ Window'});
    }

    if (user.hasRole([Role.ADMIN, Role.TIMESHEET_MANAGEMENT])) {
      options.push({id: 'timesheet', title: 'Timesheet Manage'});
    }

    return options;
  }

  /**
   * Called when the user changes the search mode.
   *
   * If the current route is a person or hq page, switch to the new view with displayed person.
   *
   * HQ Window workers were viewing a person in the wrong mode, and wanting to use options to
   * change the view instead of using the 'Switch to {HQ Window,Person}' link -- because
   * playa brain is a thing and interfaces get used in ways you never intended.

   * @param {string} fieldName
   * @param {string} mode
   */

  @action
  modeChange(fieldName, mode) {
    const route = this.router.currentRouteName;

    if (!route.startsWith('person.') && !route.startsWith('hq.')) {
      return;
    }

    const person = route.startsWith('person') ? this.personController.person : this.hqController.person;

    if (!person) {
      return;
    }

    this.transitionToRoute((this._modeRoutes[mode] || 'person.index'), person.id);
  }

  /**
   * Transition to the selected person/asset. Clear the query and results, blur the input field.
   *
   * @param item
   * @private
   */

  _showItem(item) {
    if (this.searchType == 'asset') {
      this.transitionToRoute('search.assets', {queryParams: {barcode: item.barcode, year: this.searchYear}});
    } else {
      this.transitionToRoute((this._modeRoutes[this.searchForm.mode] || 'person.index'), item.id);
    }

    this.set('showSearchOptions', false);
    this.set('query', '');
    this.set('enterPressed', false);
    document.querySelector('#search-bar input').blur();
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
  searchChangeAction(item) {
    if (item) {
      this._showItem(item);
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
      debounce(this, this._performSearch, [query, powerSelect], resolve, reject, SEARCH_RATE_MS);
    });
  }

  /*
   * Search for the person
   */

  _performSearch([query, powerSelect], resolve, reject) {
    query = query.trim();

    // query has to be two characters or more..
    if (query.length < 2) {
      return reject();
    }

    // Person id lookup
    let type;
    if (query.startsWith('#')) {
      type = 'asset'
    } else if (query.startsWith('+')) {
      type = 'person-id';
    } else {
      type = 'person';
    }

    this.set('searchType', type);

    if (type == 'asset') {
      this._searchAsset(query, powerSelect, resolve, reject);
    } else {
      this._searchPerson(query, powerSelect, resolve, reject);
    }
  }

  _searchAsset(query, powerSelect, resolve, reject) {
    let year, barcode;

    query = query.replace('#', '').replace(/ /g, '');
    if (query.includes(':')) {
      [barcode, year] = query.split(':');
      if (year.length != 4) {
        return resolve([]);
      }
    } else {
      barcode = query;
      year = this.house.currentYear();
    }

    this.set('searchYear', year);

    this.ajax.request('asset', {data: {barcode, year}})
      .then((results) => {
        if (results.asset.length == 0) {
          return resolve([]);
        }

        const asset = results.asset.firstObject;
        const searchResults = [{
          barcode: asset.barcode,
          description: asset.description,
          type: asset.temp_id,
        }];

        if (this.enterPressed) {
          /*
           * Allow EPS to render the list, and then choose the item.
           * EPS will tend 'blur' correctly by removing the results box.
           */
          setTimeout(() => {
            run.schedule('afterRender', () => {
              powerSelect.actions.choose(asset);
            });
          }, 50);
        }

        this.set('searchResults', searchResults);
        return resolve(searchResults);
      }).catch((response) => {
      this.house.handleErrorResponse(response);
      return reject();
    });
  }

  _searchPerson(query, powerSelect, resolve, reject) {
    const form = this.searchForm;

    const params = {
      basic: 1,
      query
    };

    if (form.mode == 'hq') {
      // restrict search to callsign and a handful of active-like statuses
      params.search_fields = 'callsign';
      params.statuses = 'active,alpha,prospective,retired,non ranger,inactive,inactive extension';
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
      this.house.handleErrorResponse(response);
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
    if (event.code === "Enter") {
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
    this.set('searchYear', null);
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

    fields.push('#barcode');

    const arrayToSentence = (a, conjunction) => [a.slice(0, -1).join(', '), a.pop()].filter(w => w !== '').join(` ${conjunction} `);

    return `Enter a ${arrayToSentence(fields, 'or')} to search`;
  }

  get applicationVersion() {
    return ENV.APP.version;
  }

  get buildTimestamp() {
    return ENV.APP.buildTimestamp;
  }
}
