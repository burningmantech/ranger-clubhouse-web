import Model, { attr } from '@ember-data/model';
import { computed } from '@ember/object';

export default class PersonMessageModel extends Model {
  @attr('number') person_id;

  // Only used for creating the message
  @attr('string') recipient_callsign;

  @attr('string') message_from;

  @attr('number', { readOnly: true }) sender_person_id;

  @attr('number', { readOnly: true }) creator_person_id;
  @attr('string', { readOnly: true }) creator_callsign;

  @attr('string') subject;
  @attr('string') body;
  @attr('date') sent_at;

  @attr('boolean', { readOnly: true }) delivered;

  @computed('creator_person_id', 'sender_person_id')
  get isDictacted() {
      return (this.creator_person_id != this.sender_person_id);
  }
}
