import Component from '@ember/component';
import { computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { config } from 'clubhouse/utils/config';

export default class TicketThresholdComponent extends Component {
  @argument('number') credits;
  @argument('number') creditsEarned;

  // Reduce price ticket threshold
  rpThreshold = parseFloat(config('RpTicketThreshold'));
  // Staff credentials threshold
  scThreshold = parseFloat(config('ScTicketThreshold'));
  yearThreshold = parseInt(config('YrTicketThreshold'));
  ticketYear = parseInt(config('YrTicketThreshold'))+1;

  @computed()
  get showForThisYear() {
    const date = new Date();
    let year = date.getFullYear();
    const month = date.getMonth(); // month is 0 to 11

    // Hack for next year.
    if (month >= 9) {
      year++;
    }

    return year == this.yearThreshold;
  }

  @computed('credits')
  get almostRPTicket() {
    return this.credits >= (this.rpThreshold - 2);
  }

  @computed('credits')
  get rpDelta() {
    return (this.rpThreshold - this.credits);
  }

  @computed('credits')
  get reachedRPThreshold() {
    return (this.credits >= this.rpThreshold);
  }

  @computed('credits')
  get withinRPThreshold() {
    return (this.credits >= this.rpThreshold) && (this.credits <= (this.rpThreshold+2));
  }

  @computed('credits')
  get almostSCThreshold() {
    return (this.credits >= (this.scThreshold - 5));
  }

  @computed('credits')
  get scDelta() {
    return (this.scThreshold - this.credits);
  }

  @computed('credits')
  get reachedSCThreshold() {
    return (this.credits >= this.scThreshold);
  }

  @computed('credits')
  get withinSCThreshold() {
    return (this.credits >= this.scThreshold && this.credits <= (this.scThreshold + 2));
  }
}
