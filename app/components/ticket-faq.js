import Component from '@glimmer/component';

const topicDescriptions = {
  alpha: 'Setup Access Passes for Prospectives and Alphas',
  provisions: 'Provisions (meals, showers, etc)',
  ticketing: 'Ticketing',
  vp: 'Vehicle Passes',
  wap: 'Setup Access Passes',
};

export default class TicketFaqComponent extends Component {
  constructor() {
    super(...arguments);
    const topic = this.args.topic;
    this.url = this.args.ticketingInfo.faqs[topic];
    this.topicDescription = topicDescriptions[topic];
  }
}
