import Model, {attr} from '@ember-data/model';
import dayjs from 'dayjs';
import {tracked} from '@glimmer/tracking';

export default class SlotModel extends Model {
  @attr('shiftdate') begins;
  @attr('shiftdate') ends;
  @attr('number') position_id;
  @attr('string') description;
  @attr('number') max;
  @attr('string') url;
  @attr('boolean') active;
  @attr('number') trainer_slot_id;
  @attr('number') parent_signup_slot_id;

  // signed_up is a column maintained by slot sign ups,
  // should not be directly editable.
  @attr('number', {readOnly: true}) signed_up;

  // Credits is computed
  @attr('number', {readOnly: true}) credits;
  @attr('', {readOnly: true}) position;
  @attr('', {readOnly: true}) trainer_slot;
  @attr('', { readOnly: true}) parent_signup_slot;

  @attr('string', {defaultValue: 'America/Los_Angeles'}) timezone;
  @attr('string', {readOnly: true}) timezone_abbr;

  @tracked selected; // Used to administer slots

  get slotDay() {
    const begins = this.begins;
    let date;
    try {
      date = dayjs(begins).format('YYYY-MM-DD');
    } catch (error) {
      return begins + ' ' + error;
    }

    return date;
  }

  get begins_format() {
    return dayjs(this.begins).format('ddd MMM DD [@] HH:mm');
  }

  get position_title() {
    const position = this.position;
    return position ? position.title : `Position #${this.position_id}`;
  }

  get trainer_slot_title() {
    const trainer = this.trainer_slot;
    return (trainer && trainer.position) ? trainer.position.title : `Position #${this.trainer_slot_id}`;
  }

  get isNonPacific() {
    return this.timezone_abbr !== 'PST' && this.timezone_abbr !== 'PDT';
  }
}
