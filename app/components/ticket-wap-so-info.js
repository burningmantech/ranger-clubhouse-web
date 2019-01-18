import Component from '@ember/component';
import { computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';

import moment from 'moment';

export default class TicketWapSoInfoComponent extends Component {
  @argument(optional('object')) wapSOList;
  @argument(optional('string')) ticketingStatus;
  @argument('object') saveSONames;
  @argument('object') ticketingInfo;

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
