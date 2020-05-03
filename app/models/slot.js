import Model, { attr } from '@ember-data/model';
import { computed } from '@ember/object';
import moment from 'moment';

export default class SlotModel extends Model {
  @attr('shiftdate') begins;
  @attr('shiftdate') ends;
  @attr('number') position_id;
  @attr('string') description;
  @attr('number') max;
  @attr('string') url;
  @attr('boolean') active;
  @attr('number') trainer_slot_id;

  // signed_up is a column maintained by slot sign ups,
  // should not be directly editable.
  @attr('number', { readOnly: true}) signed_up;

  // Credits is computed
  @attr('number', { readOnly: true}) credits;
  @attr('', { readOnly: true}) position;
  @attr('', { readOnly: true}) trainer_slot;


  @computed('begins', 'slot_begins')
  get slotDay() {
    const begins = this.begins;
    let date;
    try {
      date = moment(begins).format('YYYY-MM-DD');
    } catch (error) {
      return begins + ' '+error;
    }

    return date;
  }

  @computed('begins')
  get begins_format() {
    return moment(this.begins).format('ddd MMM DD [@] HH:mm');
  }

  @computed('position_id', 'position')
  get position_title() {
    const position = this.position;
    return position ? position.title : `Position #${this.position_id}`;
  }

  @computed('trainer_slot.position.title', 'trainer_slot_id')
  get trainer_slot_title() {
    const trainer = this.trainer_slot;
    return (trainer && trainer.position) ? trainer.position.title : `Position #${this.trainer_slot_id}`;

  }
}
