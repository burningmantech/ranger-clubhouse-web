import DS from 'ember-data';
import { attr } from '@ember-decorators/data';
import { computed } from '@ember-decorators/object';

export default class PositionCreditModel extends DS.Model {
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
