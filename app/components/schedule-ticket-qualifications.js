import Component from '@glimmer/component';
import {setting} from 'clubhouse/utils/setting';
import {service} from '@ember/service';

export default class TicketThresholdComponent extends Component {
  @service house;

  // Specia Price Ticket threshold
  rpThreshold = parseFloat(setting('RpTicketThreshold'));
  // Staff credentials threshold
  scThreshold = parseFloat(setting('ScTicketThreshold'));

  yearThreshold = this.house.currentYear();
  ticketYear = this.yearThreshold + 1;

  get showForThisYear() {
    return +this.args.year === this.yearThreshold;
  }

  get almostRPTicket() {
    return this.args.credits >= 0;
  }

  get rpDelta() {
    return (this.rpThreshold - this.args.credits);
  }

  get reachedRPThreshold() {
    return (this.args.credits >= this.rpThreshold);
  }

  get withinRPThreshold() {
    return (this.args.credits >= this.rpThreshold) && (this.args.credits <= (this.rpThreshold + 2.0));
  }

  get almostSCThreshold() {
    return (this.args.credits >= (this.scThreshold - 5));
  }

  get scDelta() {
    return (this.scThreshold - this.args.credits);
  }

  get reachedSCThreshold() {
    return (this.args.credits >= this.scThreshold);
  }

  get withinSCThreshold() {
    return (this.args.credits >= this.scThreshold && this.args.credits <= (this.scThreshold + 2.0));
  }
}
