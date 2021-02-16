import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {inject as service} from '@ember/service';

export default class AppreciationProgressComponent extends Component {
  @tracked isLoading = false;
  @service ajax;
  @service house;

  constructor() {
    super(...arguments);

    this.isLoading = true;

    this.ajax.request('ticketing/thresholds').then((result) => {
      const {timesheetSummary} = this.args;
      const thresholds = result.thresholds;
      const credits = timesheetSummary.total_credits;
      const hours = timesheetSummary.counted_duration;

      this.calculateItem('reducedPriceTicket', credits, thresholds.RpTicketThreshold, 'credits');
      this.calculateItem('staffCredential', credits, thresholds.ScTicketThreshold, 'credits');
      this.calculateItem('eatEventPeriod', hours, thresholds.AllYouCanEatEventPeriodThreshold, 'hours');
      this.calculateItem('eatEventWeek', timesheetSummary.event_duration, thresholds.AllYouCanEatEventWeekThreshold, 'hours');
      this.calculateItem('showerAccess', hours, thresholds.ShowerAccessThreshold, 'hours');
      this.calculateItem('showerPog', hours, thresholds.ShowerPogThreshold, 'hours');

      this.calculateItem('tshirt', hours, thresholds.ShirtShortSleeveHoursThreshold, 'hours');
      this.calculateItem('shirtLong', hours, thresholds.ShirtLongSleeveHoursThreshold, 'hours');

      if (timesheetSummary.other_duration) {
        this.otherHours = Math.floor(timesheetSummary.other_duration / 3600.0).toFixed(2);
      }
      this.isLoading = false;
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  calculateItem(name, value, threshold, type) {
    const item = {
      type
    };

    if (type === 'hours') {
      item.value = this.hourMinute(value);
      item.threshold = threshold;
      threshold = threshold * 3600;
      item.needs = (value >= threshold) ? 0 : this.hourMinute(threshold - value);
    } else {
      item.value = value.toFixed(2);
      item.threshold = threshold.toFixed(2);
      item.needs = (threshold - value).toFixed(2);
    }

    if (value >= threshold) {
      item.earned = true;
      item.width = 100;
      item.needs = 0;
    } else {
      item.earned = false;
      item.width = Math.floor((value / threshold) * 100);
    }
    this[name] = item;
  }

  hourMinute(duration) {
    if (!duration) {
      return '0:00';
    }
    const minutes = Math.floor((duration / 60) % 60);
    const hours = Math.floor(duration / 3600);

    if (minutes < 10) {
      return `${hours}:0${minutes}`;
    } else {
      return `${hours}:${minutes}`;
    }
  }
}
