import Component from '@glimmer/component';
import { debounce } from '@ember/runloop';
import { action } from '@ember/object';
import RSVP from 'rsvp';
import PersonMessageValidations from 'clubhouse/validations/person-message';
import { service } from '@ember/service';
import { isEmpty } from '@ember/utils';

export default class MessageNewComponent extends Component {
  @service ajax;

  personMessageValidations = PersonMessageValidations;

  constructor() {
    super(...arguments);

    const {message} = this.args;
    this.isFromMessage = !isEmpty(message.message_from);
  }

  async _performSearch(callsign, resolve, reject) {
    callsign = callsign.trim();

    if (callsign.length < 2) {
      return reject();
    }

    try {
      const {callsigns} = await this.ajax.request('callsigns', {data: {query: callsign, type: "message", limit: 20}});
      if (callsigns.length > 0) {
        return resolve(callsigns.map(row => row.callsign));
      }
      return reject();
    } catch (e) {
      this.house.handleErrorResponse(e);
    }
  }

  @action
  searchCallsignAction(callsign) {
    return new RSVP.Promise((resolve, reject) => {
      debounce(this, this._performSearch, callsign, resolve, reject, 350);
    });
  }
}
