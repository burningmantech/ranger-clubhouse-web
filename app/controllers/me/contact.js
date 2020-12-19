import Controller from '@ember/controller';
import EmberObject from '@ember/object';
import { action } from '@ember/object';
import { debounce } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';

const SEARCH_RATE_MS = 300;

export default class MeContactController extends Controller {
  queryParams = [ 'callsign' ];

  searchForm = EmberObject.create({ callsign: '' });

  @tracked ranger = null;
  @tracked isSubmitting = null;
  @tracked isSearchingParam = '';
  @tracked noMatch = '';
  @tracked foundCallsigns = [];

  _performSearch(model, fromRoute=false) {
    const callsign = model.callsign.trim();

    if (callsign.length < 2) {
      return;
    }

    this.isSubmitting =  true;
    this.noMatch = null;
    this.isSearchingParam = fromRoute;
    this.ajax.request('callsigns', { data: { query: callsign, type: 'contact', limit: 10 }}).then((results) => {
      this.foundCallsigns =  results.callsigns;
      if (!this.foundCallsigns.length) {
        this.noMatch = callsign;
      } else if (fromRoute) {
        // When the search was initiated from the route because the 'callsign' parameter
        // was on the URL, loop through the results and pop up the contact form automatically
        // if matched.

        const callsign = this.callsign.toLowerCase();
        this.foundCallsigns.forEach((person) => {
          if (person.allow_contact && person.callsign.toLowerCase() == callsign) {
            this.ranger =  this.foundCallsigns[0];
            this.foundCallsigns = [];
          }
        });
      }
    }).catch((response) => {
      this.house.handleErrorResponse(response);
    }).finally(() => {
      this.isSubmitting =  false;
      this.isSearchingParam = '';
    })

  }

  @action
  searchOnChange(field, model) {
    // Delay the search if a name if being typed
    debounce(this, this._performSearch, model, SEARCH_RATE_MS);
  }

  @action
  contactRanger(callsign) {
    this.ranger = callsign;
  }

  @action
  doneAction() {
    this.ranger = null;
    this.searchForm.set('callsign', '');
    const field = document.querySelector('[autofocus]');
    if (field) {
      field.focus();
    }
  }
}
