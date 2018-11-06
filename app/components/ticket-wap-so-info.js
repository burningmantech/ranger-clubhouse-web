import Component from '@ember/component';
import { computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';

import moment from 'moment';

export default class TicketWapSoInfoComponent extends Component {
  @argument wapSOList;
  @argument ticketingStatus;
  @argument saveSONames;
  @argument ticketingInfo;

  @computed('ticketingStatus')
  get maxSOWAP() {
    return this.ticketingStatus.wap_so_max;
  }

  @computed('ticketingStatus')
  get isAccepting() {
    return this.ticketingStatus == 'accept';
  }

  @computed('ticketingStatus')
  get defaultDate() {
    return moment(this.ticketingInfo.wap_so_default_date).format('dddd MMMM Do, YYYY');
  }
}
