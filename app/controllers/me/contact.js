import Controller from '@ember/controller';
import EmberObject from '@ember/object';
import { action } from '@ember/object';
import { debounce } from '@ember/runloop';
import $ from 'jquery';

const SEARCH_RATE_MS = 300;

export default class MeContactController extends Controller {
  queryParams = [ 'callsign' ];

  ranger = null;
  isSubmitting = null;
  searchForm = EmberObject.create({ callsign: '' });

  _performSearch(model, fromRoute=false) {
    const callsign = model.get('callsign').trim();

    if (callsign == '' || callsign.length < 2) {
      return;
    }

    this.set('isSubmitting', true);
    this.set('noMatch', null);
    this.set('isSearchingParam', fromRoute);
    this.ajax.request('callsigns', { data: { query: callsign, type: 'contact', limit: 10 }}).then((results) => {
      this.set('foundCallsigns', results.callsigns);
      if (this.foundCallsigns.length == 0) {
        this.set('noMatch', callsign);
      } else if (fromRoute) {
        // When the search was initiated from the route because the 'callsign' parameter
        // was on the URL, loop through the results and pop up the contact form automatically
        // if matched.

        const callsign = this.callsign.toLowerCase();
        this.foundCallsigns.forEach((person) => {
          if (person.allow_contact && person.callsign.toLowerCase() == callsign) {
            this.set('ranger', this.foundCallsigns[0]);
            this.set('foundCallsigns', []);
          }
        });
      }
    }).catch((response) => {
      this.house.handleErrorResponse(response);
    }).finally(() => {
      this.set('isSubmitting', false);
      this.set('isSearchingParam', false);
    })

  }

  @action
  searchOnChange(field, model) {
    // Delay the search if a name if being typed
    debounce(this, this._performSearch, model, SEARCH_RATE_MS);
  }

  @action
  contactRanger(ranger) {
    this.set('ranger', ranger);
  }

  @action
  doneAction() {
    this.set('ranger', null);
    this.searchForm.set('callsign', '');
    $('[autofocus]').focus();
  }
}
