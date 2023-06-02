import Component from '@glimmer/component';
import {action} from '@ember/object';
import {cached, tracked} from '@glimmer/tracking';
import {Role} from 'clubhouse/constants/roles';
import {
  ACTIVE,
  ALPHA,
  INACTIVE, INACTIVE_EXTENSION,
  NON_RANGER, PROSPECTIVE,
} from 'clubhouse/constants/person_status';
import {debounce} from '@ember/runloop';
import {service} from '@ember/service';
import {inject as controller} from '@ember/controller';
import {setting} from 'clubhouse/utils/setting';
import {isEmpty} from '@ember/utils';
import RSVP from 'rsvp';


/*
 The search bar lives on top of the page just below the top navigation bar.
 */

// How often in milliseconds should a search be performed as the user is typing.
const SEARCH_RATE_MS = 300;

const SearchGroupTitles = {
  'callsign': 'callsign',
  'email': 'email',
  'fka': 'FKA',
  'id': 'Person Record #',
  'last': 'last name',
  'name': 'real name',
  'old-email': 'old email',
};

const HqStatuses = [
  ACTIVE,
  ALPHA,
  INACTIVE,
  INACTIVE_EXTENSION,
  NON_RANGER,
  PROSPECTIVE,
  'cheetahcub'   // pseudo-status, find anyone who is signed up for a Cheetah Cub shift.
].join(',');

// What page to route to based on the search mode selected
const MODE_ROUTES = {
  'account': 'person.index',
  'hq': 'hq.index',
  'timesheet': 'person.timesheet'
};

const SEARCH_MODE_KEY = 'search-mode';

export default class SearchItemBarComponent extends Component {
  @service router;
  @service session;
  @service ajax;
  @service house;

  @controller('person') personController;
  @controller('hq') hqController;

  @tracked searchMode = 'account';

  @tracked showSearchOptions = false;
  @tracked searchText = '';
  @tracked searchResults = [];
  @tracked searchType = 'person';
  @tracked searchPlaceholder = '';

  @tracked noResultsText;

  keepDialogOpenAfterTransition = false;

  constructor() {
    super(...arguments);

    const onDutyPosition = this.session.user.onduty_position;

    const savedMode = this.house.getKey(SEARCH_MODE_KEY);
    const options = this.modeOptions;

    let mode = '';
    if (options.find((opt) => opt.value === savedMode)) {
      mode = savedMode;
    } else {
      mode = (onDutyPosition && (onDutyPosition.subtype === 'hq' || onDutyPosition.subtype === 'mentor')) ? 'hq' : 'account';
    }

    this.house.setKey(SEARCH_MODE_KEY, mode);
    this.searchMode = mode;

    this.router.on('routeDidChange', this, 'trackRouteTransition');

    this._buildPlaceholder();
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.router.off('routeDidChange', this, 'trackRouteTransition');
  }

  trackRouteTransition() {
    if (!this.keepDialogOpenAfterTransition) {
      this.session.showSearchDialog = false; // close up the box on route change.
    } else {
      this.keepDialogOpenAfterTransition = false;
    }

  }

  /**
   * Build up the options for search type
   *
   * account - redirect to Person Manage
   * timesheet - redirect to the person timesheet management page
   * hq - redirect to the HQ Window interface
   *
   * @returns {{label: string, value: string}[]}
   */

  @cached
  get modeOptions() {
    const user = this.session.user;
    const options = [{value: 'account', label: 'Person Manage'}];

    if (user.has_hq_window && setting('HQWindowInterfaceEnabled')) {
      options.unshift({value: 'hq', label: 'HQ Window'});
    }

    if (this.session.hasRole([Role.ADMIN, Role.TIMESHEET_MANAGEMENT]) || user.has_hq_window) {
      options.push({value: 'timesheet', label: 'Timesheet Manage'});
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
   *
   * @param {string} mode
   */

  @action
  modeChange(mode) {
    this.searchMode = mode;
    const route = this.router.currentRouteName;

    this.house.setKey(SEARCH_MODE_KEY, mode);
    this._buildPlaceholder();

    if (!route.startsWith('person.') && !route.startsWith('hq.')) {
      return;
    }

    const person = route.startsWith('person') ? this.personController.person : this.hqController.person;

    if (!person) {
      return;
    }

    this.keepDialogOpenAfterTransition = true;

    this.router.transitionTo((MODE_ROUTES[mode] || 'person.index'), person.id);
  }

  /**
   * Transition to the selected person/asset. Clear the query and results.
   *
   * @param {Object} item
   * @private
   */

  _showItem(item) {
    switch (this.searchType) {
      case 'asset':
        this.router.transitionTo('search.assets', {queryParams: {barcode: item.barcode, year: this.searchYear}});
        break;

      case 'vehicle':
        this.router.transitionTo('search.vehicles', {queryParams: {id: item.id}});
        break;

      default:
        this.router.transitionTo((MODE_ROUTES[this.searchMode] ?? 'person.index'), item.id);
        break;
    }

    this.session.showSearchDialog = false;
    this.searchText = '';
    this.searchResults = [];
  }

  /**
   * Show the person when the user clicks on an option.
   *
   * @param {string} item
   */

  @action
  searchSelectAction(item) {
    if (item) {
      this._showItem(item);
    }
  }

  /**
   * As the user types, searchAction will be called. Queue up
   * the search once every SEARCH_RATE_MS milliseconds.
   *
   * @param {string} query
   */

  @action
  searchAction(query) {
    this.searchText = query;
    return new RSVP.Promise((resolve, reject) => debounce(this, this._performSearch, query, resolve, reject, SEARCH_RATE_MS));
  }

  /**
   * Search for the person
   */

  _performSearch(query, resolve, reject) {
    query = query.trim();

    // query has to be two characters or more..
    if (query.length < 2) {
      return reject();
    }

    let type;
    switch (query.charAt(0)) {
      case '#':
        // Asset barcode lookup
        type = 'asset'
        break;

      case '!':
        // Vehicle search
        type = 'vehicle';
        break;

      case '+':
        // Person id lookup
        type = 'person-id';
        break;

      default:
        type = 'person';
        break;
    }

    this.searchType = type;

    switch (type) {
      case 'asset':
        this._searchAsset(query, resolve, reject);
        break;
      case 'vehicle':
        this._searchVehicle(query, resolve, reject);
        break;

      default:
        this._searchPerson(query, resolve, reject);
        break;
    }
  }

  /**
   * Search for an asset
   *
   * @param {string} query
   * @param resolve
   * @param reject
   * @returns {Promise<*>}
   * @private
   */

  async _searchAsset(query, resolve, reject) {
    let year, barcode;

    // Strip off '#'
    query = query.replace('#', '').replace(/ /g, '');

    if (query.includes(':')) {
      // Asset search in a year
      [barcode, year] = query.split(':');
      if (year.length !== 4) {
        return resolve([]);
      }
    } else {
      barcode = query;
      year = this.house.currentYear();
    }

    this.searchYear = year;

    try {
      const {asset} = await this.ajax.request('asset', {data: {barcode, year}});
      if (!asset.length) {
        // Nothing matched
        this.noResultsText = `No assets found for the ${year} event.`;
        return resolve([]);
      }

      const item = asset[0];
      const searchResults = [{
        barcode: item.barcode,
        description: item.description,
        type: item.temp_id,
      }];

      this.searchResults = searchResults;
      return resolve(searchResults);
    } catch (response) {
      this.house.handleErrorResponse(response);
      return reject();
    }
  }

  /**
   * Search for a vehicle
   *
   * @param {string} query
   * @param resolve
   * @param reject
   * @returns {Promise<*>}
   * @private
   */

  async _searchVehicle(query, resolve, reject) {
    // Strip off '!'
    let number = query.replace('!', '').replace(/ /g, '');

    let event_year;
    if (number.includes(':')) {
      // Vehicle search in a year
      const [base, year] = number.split(':');
      if (year.length !== 4) {
        return resolve([]);
      }
      number = base;
      event_year = +year;
    } else {
      event_year = this.house.currentYear();
    }


    try {
      const {vehicle} = await this.ajax.request('vehicle', {
        data: {
          number,
          status: 'approved',
          event_year
        }
      });
      if (!vehicle.length) {
        // Nothing matched
        this.noResultsText = `No vehicles found for the ${event_year} event.`;
        return resolve([]);
      }

      const results = vehicle.map((v) => {
        let name;
        if (v.person) {
          name = `Owner ${v.person.callsign}`;
        } else if (!isEmpty(v.team_assignment)) {
          name = `Team ${v.team_assignment}`;
        } else {
          name = 'Fleet Vehicle'
        }

        const numbers = [];

        if (!isEmpty(v.license_number)) {
          numbers.push(`Lic #${v.license_state}-${v.license_number}`);
        }

        if (!isEmpty(v.rental_number)) {
          numbers.push(`Rental #${v.rental_number}`);
        }

        if (!isEmpty(v.sticker_number)) {
          numbers.push(`Sticker #${v.sticker_number}`);
        }

        return {
          id: v.id,
          name,
          numbers: numbers.join(' '),
          description: `${v.vehicle_type} ${v.vehicle_year}  ${v.vehicle_make} ${v.vehicle_model} ${v.vehicle_color}`
        }
      });

      this.searchResults = results;
      return resolve(results);
    } catch (response) {
      this.house.handleErrorResponse(response);
      return reject();
    }
  }

  /**
   * Search for a person
   *
   * @param {string} query
   * @param resolve
   * @param reject
   * @returns {Promise<*>}
   * @private
   */

  async _searchPerson(query, resolve, reject) {
    const isHQSearch = this.searchMode === 'hq';

    let params;

    if (isHQSearch) {
      // restrict search to callsign and a handful of active-like statuses
      params = {
        search_fields: 'callsign',
        statuses: HqStatuses
      };
    } else if (query.startsWith('+')) {
      params = {search_fields: 'id'};
    } else {
      const match = query.match(/^(callsign|name|fka|last)\s*:\s*(.*)$/i);
      if (match) {
        // Search all statuses when a explicit field is given to search, i.e. don't set params.statuses.
        params = {
          search_fields: match[1]
        };
        query = match[2];
      } else if (query.includes('@')) {
        if (!this.session.canViewEmail) {
          this.noResultsText = 'You do not have the permissions to search by email';
          return resolve([]);
        }
        params = {
          search_fields: 'email'
        };
      } else {
        params = {
          search_fields: 'callsign,name,fka',
          status_groups: 1
        }
      }
    }

    if (query.length < 2) {
      return reject();
    }

    params.query = query;


    // And fire away!
    try {
      const result = await this.ajax.request('person/search', {data: params});
      this.searchResults = result;
      let searched;
      if (params.status_groups) {
        const sections = result.map((group) => ({
          sectionTitle: group.title,
          groups: this._buildSearchResults(group.results)
        }));

        if (sections.length > 1) {
          searched = {
            banner: 'Multiple status categories found:',
            sections
          };

        } else if (sections.length === 1) {
          searched = {
            banner: `Showing results for ${sections[0].sectionTitle} status(es):`,
            groups: sections[0].groups,
          }
        } else {
          searched = {};
          this.noResultsText = 'No people were found matching callsign, name, or fka';
        }
      } else {
        searched = {groups: this._buildSearchResults(result)};
        if (!searched.groups.length) {
          if (isHQSearch) {
            this.noResultsText = 'No callsigns matched';
          } else {
            this.noResultsText = `No ${params.search_fields} matched`;
          }
        }
      }
      return resolve(searched);
    } catch (e) {
      this.house.handleErrorResponse(e);
      return reject();
    }
  }

  _buildSearchResults(result) {
    let index = 0;
    return result.map(({people, field}) => {
      people.forEach((person) => person.index = index++);
      return {
        isGroup: true,
        title: SearchGroupTitles[field] ?? `Unknown group ${field}`,
        field: field,
        items: people
      };
    })
  }

  /**
   * Called when search bar obtains focus. Determine if the options box should be shown.
   */

  @action
  searchFocusAction() {
    this.searchResults = [];
    this.searchYear = null;

    if (this.searchText !== '') {
      return new RSVP.Promise((resolve, reject) => {
        debounce(this, this._performSearch, this.searchText, resolve, reject, 1);
      });
    }
  }

  /**
   * Close up the options box
   */

  @action
  hideSearchBoxAction() {
    this.session.showSearchDialog = false;
  }

  /**
   * Build up the placeholder text based on search mode and fields selected
   *
   * @private
   */

  _buildPlaceholder() {
    const fields = [];

    if (this.searchMode === 'hq') {
      fields.push('callsign');
    } else {
      fields.push('callsign');
      fields.push('name');
      if (this.session.canViewEmail) {
        fields.push('email');
      }

      fields.push('fka');
    }

    fields.push('#barcode');
    fields.push('!vehicle');

    const arrayToSentence = (a, conjunction) => [a.slice(0, -1).join(', '), a.pop()].filter(w => w !== '').join(` ${conjunction} `);

    this.searchPlaceholder = arrayToSentence(fields, 'or');
  }
}
