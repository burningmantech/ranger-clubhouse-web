import Component from '@ember/component';
import { debounce } from '@ember/runloop';
import { action } from '@ember/object';

import RSVP from 'rsvp';

import PersonMessageValidations from 'clubhouse/validations/person-message';

export default class MessageNewComponent extends Component {
  message = null;
  onSubmit = null;
  onCancel = null;
  isSubmitting = null;

  personMessageValidations = PersonMessageValidations;

  _performSearch(callsign, resolve, reject) {
    callsign = callsign.trim();

    if (callsign.length < 2) {
      return reject();
    }

    return this.ajax
          .request('callsigns', { data: {query: callsign, type: "message", limit: 20} })
          .then((result) => {
            if (result.callsigns.length > 0) {
              return resolve(result.callsigns.map(row => row.callsign));
            }
            return reject();
          }, reject);
  }

  @action
  searchCallsignAction(callsign) {
    return new RSVP.Promise((resolve, reject) => {
      debounce(this, this._performSearch, callsign, resolve, reject, 350);
    });
  }

  @action
  submitAction(model, isValid) {
    this.onSubmit(model, isValid);
  }

  @action
  cancelAction() {
    this.onCancel();
  }
}
