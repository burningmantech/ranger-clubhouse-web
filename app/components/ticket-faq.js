import Component from '@glimmer/component';

const topicDescriptions = {
    ticketing: 'Ticketing',
    vp: 'Vehicle Passes',
    wap: 'Work Access Passes',
    alpha: 'Work Access Passes for Prospectives and Alphas'
};

export default class TicketFaqComponent extends Component {
  constructor() {
    super(...arguments);
    const topic = this.args.topic;
    this.url = this.args.ticketingInfo.faqs[topic];
    this.topicDescription = topicDescriptions[topic];
  }
}
