import Model, { attr } from '@ember-data/model';
import { tracked } from '@glimmer/tracking';
import moment from 'moment';

export default class PositionCreditModel extends Model {
  @attr('shiftdate') start_time;
  @attr('shiftdate') end_time;
  @attr('string') description;
  @attr('number') position_id;
  @attr('number') credits_per_hour;

  @attr('', { readOnly: true}) position;

  @tracked selected;  // used to duplicate credits in admin/credits

  get positionTitle() {
    return this.position ? this.position.title : `Position #${this.position_id}`;
  }

  get creditDay() {
    const begins = this.start_time;
    let date;
    try {
      date = moment(begins).format('YYYY-MM-DD');
    } catch (error) {
      return begins + ' '+error;
    }

    return date;
  }

}
