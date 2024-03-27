import Model, {attr} from '@ember-data/model';

export default class PersonMessageModel extends Model {
  @attr('number') person_id;

  // Only used for creating the message
  @attr('string') recipient_callsign;

  @attr('string') message_from;

  @attr('number', {readOnly: true}) sender_person_id;
  @attr('number', {readOnly: true}) sender_callsign;

  @attr('number', {readOnly: true}) creator_person_id;
  @attr('string', {readOnly: true}) creator_callsign;

  @attr('string', {readOnly: true}) expires_at;
  @attr('boolean', {readOnly: true}) has_expired;

  @attr('number') reply_to_id;

  @attr('string') subject;
  @attr('string') body;
  @attr('date') created_at;

  @attr('string') sender_photo_url;

  @attr('boolean', {readOnly: true}) delivered;
  @attr('boolean', {readOnly: true}) is_rbs;
  @attr('number', {readOnly: true}) broadcast_id;

  get isDictated() {
    return this.is_rbs ? false : (this.creator_person_id !== this.sender_person_id);
  }
}
