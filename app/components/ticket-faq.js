import Component from '@ember/component';

import { tagName } from '@ember-decorators/component';

const topicDescriptions = {
    ticketing: 'Ticketing',
    vp: 'Vehicle Passes',
    wap: 'Work Access Passes',
    alpha: 'Work Access Passes for Prospectives and Alphas'
};

@tagName('')
export default class TicketFaqComponent extends Component {
  topic = null;
  ticketingInfo = null;

  didReceiveAttrs() {
    super.didReceiveAttrs(...arguments);
    this.set('url', this.ticketingInfo.faqs[this.topic]);
    this.set('topicDescription', topicDescriptions[this.topic]);
  }
}
