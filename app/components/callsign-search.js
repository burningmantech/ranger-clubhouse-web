import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';

export default class CallsignSearch extends Component {
  @service ajax;
  @service house;

  @tracked callsign;
  @tracked searchResults;
  @tracked searchError;
  @tracked callsignNotFound;
  @tracked isSearchingCallsigns;

  constructor() {
    super(...arguments);

    this.callsign = this.args.callsign;
  }

  clearSearchResults() {
    this.searchError = null;
    this.callsignNotFound = false;
    this.searchResults = [];
  }

  @action
  async searchForCallsigns() {
    const callsign = this.callsign.trim();

    this.clearSearchResults();

    if (callsign.length < 2) {
      this.searchError = 'Enter 2 or more characters';
      return;
    }

    try {
      this.isSearchingCallsigns = true;
      const {callsigns} = await this.ajax.request(
        'callsigns',
        {data: {query: callsign, type: this.args.type}}
      );
      this.searchResults = callsigns;
      if (!callsigns.length) {
        this.callsignNotFound = true;
      }
    } catch (e) {
      this.house.handleErrorResponse(e);
    } finally {
      this.isSearchingCallsigns = false;
    }
  }
}
