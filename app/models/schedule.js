import DS from 'ember-data';
import { computed } from '@ember/object';
const { attr } = DS;
import moment from 'moment';

export default class ScheduleModel extends DS.Model {
  // the position row id
  @attr('number', { readOnly: true }) position_id;
  // position title associated with slot
  @attr('string', { readOnly: true }) position_title;
  // position type
  @attr('string', { readOnly: true }) position_type;

  // do hours count towards appreciations
  @attr('boolean', { readOnly: true }) position_count_hours;

  // slot begin and end times. human formatted
  @attr('string', { readOnly: true }) slot_begins;
  @attr('string', { readOnly: true }) slot_ends;

  // slot begin & ends time in UNIX seconds
  @attr('number', { readOnly: true }) slot_begins_time;
  @attr('number', { readOnly: true }) slot_ends_time;

  // Length in minutes
  @attr('number', { readOnly: true }) slot_duration;

  // Location for training, or period of time (morning, swing, grave)
  @attr('string', { readOnly: true }) slot_description;
  // how many people have signed up
  @attr('number', { readOnly: true }) slot_signed_up;
  // sign up limit
  @attr('number', { readOnly: true }) slot_max;
  // set if there's a webpage providing more detail
  // (e.x. particulars about a training location)
  @attr('string', { readOnly: true }) slot_url;

  // is slot active?
  @attr('boolean', { readOnly: true }) slot_active;

  // How many trainers are signed up
  @attr('number', { readOnly: true }) trainers;
  // Possible credits earned
  @attr('number', { readOnly: true }) credits;
  // Has the slot started?
  @attr('boolean', { readOnly: true }) has_started;
  // Has the slot eneded?
  @attr('boolean', { readOnly: true }) has_ended;
  // The year this slot occurs
  @attr('number', { readOnly: true }) year;

  // contact email
  @attr('string', { readOnly: true }) contact_email;

  @computed('slot_signed_up', 'slot_max')
  get isFull() {
    return (this.slot_signed_up >= this.slot_max);
  }

  @computed('slot_begins')
  get slotDay() {
    const begins = this.slot_begins;
    let date;
    try {
      date = moment(begins).format('YYYY-MM-DD');
    } catch (error) {
      return begins + ' '+error;
    }

    return date;
  }

  // Check to see if the url is just a url and nothing else
  @computed('slot_url')
  get infoIsUrl() {
    const url = this.slot_url;

    if (!url) {
      return false;
    }

    if (/^(https?:\/\/[^\s]+)$/.exec(url)) {
      return true;
    }

    return false;
  }

  @computed('position_type')
  get isTraining() {
    return (this.position_type == 'Training');
  }
}
