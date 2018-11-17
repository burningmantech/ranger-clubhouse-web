import Controller from '@ember/controller';
import EmberObject from '@ember/object';
import { debounce } from '@ember/runloop';
import { computed, action } from '@ember-decorators/object';
import { Role } from 'clubhouse/constants/roles';
import $ from 'jquery';

// How often in milliseconds should a search be performed as
// the user is typing.
const SEARCH_RATE_MS = 300;

const SearchFields = [ 'name', 'callsign', 'email', 'formerly_known_as' ];

// Statuses to automatically exclude, unless included
const ExcludeStatus = [ 'auditor', 'past prospective' ];


export default class SearchController extends Controller {
  searchFound = true;
  searchTotal = 0;
  searchCount = 0;
  searchFailed = '';
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
  get canViewEmail() {
    return this.session.user.hasRole([Role.ADMIN, Role.VIEW_PII, Role.VIEW_EMAIL]);
  }

  // Build up a request and fire off a search
  _performSearch(model) {
    const query = model.get('query').trim();

    // bail out if query is empty, or if doing search by record id
    if (query == '' || query.startsWith('+') || query.length < 2) {
      return;
    }

    const params = { query };

    // Find out which fields to search
    const search_fields = [];
    SearchFields.forEach((field) => {
      if (model.get(field)) {
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

    if (model.get('auditor')) {
      toExclude.removeObject('auditor');
    }

    if (model.get('past_prospective')) {
      toExclude.removeObject('past prospective');
    }

    if (toExclude.length > 0) {
      params.exclude_statuses = toExclude.join(',');
    }

    // And fire away!
    this.set('isSubmitting', true);
    this.ajax.request('person', { data: params }).then((results) => {
      if (results.person.length == 0) {
        // Nothing was found.
        this.set('searchResults', [ ]);
        this.set('searchFailed', query);
        this.set('searchFound', false);
        this.set('searchTotal', 0);
        this.set('searchCount', 0);
      } else {
        this.set('searchResults', results.person);
        this.set('searchFound', true);
        this.set('searchTotal', results.meta.total);
        this.set('searchCount', results.person.length);
      }
    }).catch((response) => this.house.handleErrorResponse(response))
    .finally(() => this.set('isSubmitting', false) );
  }

  // When the user hits enter, see if one and only one result
  // was found, and route over to that person
  @action
  submit() {
    const query = this.searchForm.get('query');

    if (query.startsWith('+')) {
      this.transitionToRoute('person.index', query.slice(1));
      return;
    }

    const results = this.searchResults;
    if (!results || results.length != 1) {
      return;
    }

    this.transitionToRoute('person.index', results.firstObject.id);
  }

  // Everytime the form is changed, perform a search
  @action
  searchOnChange(field, model) {
    // Show the FKA column if FKA is included in search
    this.set('showFKA', model.get('formerly_known_as'));

    if (field.name == 'query') {
      // Delay the search if a name if being typed
      debounce(this, this._performSearch, model, SEARCH_RATE_MS);
    } else {
      // Update to any other field, redo the search.
      this._performSearch(model);
    }
  }

  // Rest the form values back to a default
  @action
  clearQuery() {
    this.searchForm.set('query', '');
    $('[autofocus]').focus();
  }
}
