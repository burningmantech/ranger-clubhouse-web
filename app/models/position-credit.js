import Model, { attr } from '@ember-data/model';
import { computed } from '@ember/object';
import moment from 'moment';

export default class PositionCreditModel extends Model {
  @attr('shiftdate') start_time;
  @attr('shiftdate') end_time;
  @attr('string') description;
  @attr('number') position_id;
  @attr('number') credits_per_hour;

  @attr('', { readOnly: true}) position;

  @computed('position_id')
  get positionTitle() {
    return this.position ? this.position.title : `Position #${this.position_id}`;
  }

  @computed('start_time')
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
