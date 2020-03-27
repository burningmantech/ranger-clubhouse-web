import Component from '@glimmer/component';
import { config } from 'clubhouse/utils/config';
import eventYear from 'clubhouse/utils/event-year';

export default class TicketThresholdComponent extends Component {
  // Reduce price ticket threshold
  rpThreshold = parseFloat(config('RpTicketThreshold'));
  // Staff credentials threshold
  scThreshold = parseFloat(config('ScTicketThreshold'));

  yearThreshold = eventYear();
  ticketYear = eventYear() + 1;

  get showForThisYear() {
    return this.args.year == this.yearThreshold;
  }

  get almostRPTicket() {
    return this.args.credits >= (this.rpThreshold - 2);
  }

  get rpDelta() {
    return (this.rpThreshold - this.args.credits);
  }

  get reachedRPThreshold() {
    return (this.args.credits >= this.rpThreshold);
  }

  get withinRPThreshold() {
    return (this.args.credits >= this.rpThreshold) && (this.args.credits <= (this.rpThreshold+2.0));
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
