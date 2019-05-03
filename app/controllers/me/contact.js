import Controller from '@ember/controller';
import EmberObject from '@ember/object';
import { action } from '@ember/object';
import { debounce } from '@ember/runloop';
import $ from 'jquery';

const SEARCH_RATE_MS = 300;

export default class MeContactController extends Controller {
  ranger = null;
  isSubmitting = null;
  searchForm = EmberObject.create({ callsign: '' });

  _performSearch(model) {
    const callsign = model.get('callsign');

    if (callsign == '' || callsign.length < 2) {
      return;
    }

    this.set('isSubmitting', true);
    this.ajax.request('callsigns', { data: { query: callsign, type: 'contact', limit: 10 }}).then((results) => {
      this.set('foundCallsigns', results.callsigns);
    }).catch((response) => {
      this.house.handleErrorResponse(response);
    }).finally(() => {
      this.set('isSubmitting', false);
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
