import DS from 'ember-data';
import { computed } from '@ember-decorators/object';
import { attr } from '@ember-decorators/data';

import moment from 'moment';

export default class SlotModel extends DS.Model {
  @attr('string') begins;
  @attr('string') ends;
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


  @computed('slot_begins')
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
    return position ? position.title : `Position #${position.title}`;
  }

  @computed('trainer_slot.position.title')
  get trainer_slot_title() {
    const trainer = this.trainer_slot;
    return (trainer && trainer.position) ? trainer.position.title : `Position #{trainer.position_id}`;

  }
}
