import Model, {attr} from '@ember-data/model';
import {tracked} from '@glimmer/tracking';

import {
  HQ_LEAD,
  HQ_LEAD_PRE_EVENT,
  HQ_SHORT,
  HQ_SUPERVISOR,
  HQ_WINDOW,
  HQ_WINDOW_PRE_EVENT
} from "clubhouse/constants/positions";
import {last} from "lodash";

export const SENDER_TYPE_OTHER = 'other';
export const SENDER_TYPE_PERSON = 'person';
export const SENDER_TYPE_RBS = 'rbs';
export const SENDER_TYPE_TEAM = 'team';

// Message was sent through Person Manage or the HQ Interface
export const MESSAGE_TYPE_NORMAL = 'normal';

// Message was sent through Me > Messages -- may only send to
// active or inactive/inactive extension Rangers
export const MESSAGE_TYPE_CONTACT = 'contact';
// The same as the above except sent through the Me > Mentors / Mentees page.
export const MESSAGE_TYPE_MENTOR = 'mentor';

const HQ_WINDOW_POSITIONS = [
  HQ_LEAD,
  HQ_LEAD_PRE_EVENT,
  HQ_SHORT,
  HQ_SUPERVISOR,
  HQ_WINDOW,
  HQ_WINDOW_PRE_EVENT,
];

export default class PersonMessageModel extends Model {
  @tracked isHidden = true;

  @attr('number') person_id;
  @attr('', {readOnly: true}) person;

  // Only used for creating the message
  @attr('string') recipient_callsign;

  @attr('string') message_from;


  @attr('string', {defaultValue: SENDER_TYPE_PERSON}) sender_type;
  @attr('number', {readOnly: true}) sender_person_id;
  @attr('', {readOnly: true}) sender_team;
  @attr('', {readOnly: true}) sender_person;

  @attr('number', {readOnly: true}) creator_person_id;
  @attr('', {readOnly: true}) creator_person;
  @attr('number', {readOnly: true}) creator_position_id;
  @attr('', {readOnly: true}) creator_position;

  @attr('string', {defaultValue: MESSAGE_TYPE_CONTACT}) message_type;


  @attr('string', {readOnly: true}) expires_at;
  @attr('boolean', {readOnly: true}) has_expired;

  @attr('boolean', {readOnly: true}) sent_before_today;
  @attr('boolean', {readOnly: true}) sent_prior_year;
  @attr('boolean', {readOnly: true}) sent_yesterday;

  @attr('number') reply_to_id;

  @attr('string') subject;
  @attr('string') body;
  @attr('date') created_at;

  @attr('string') sender_photo_url;

  @attr('boolean', {readOnly: true}) delivered;
  @attr('number', {readOnly: true}) broadcast_id;

  @attr('', {readOnly: true}) replies;

  get isDictated() {
    return this.sender_type === SENDER_TYPE_PERSON && (this.creator_person_id !== this.sender_person_id);
  }

  get isSenderRBS() {
    return this.sender_type === SENDER_TYPE_RBS;
  }

  get isSenderPerson() {
    return this.sender_type === SENDER_TYPE_PERSON;
  }

  get isSenderOther() {
    return this.sender_type === SENDER_TYPE_OTHER;
  }


  get sentFromHQWindow() {
    return HQ_WINDOW_POSITIONS.includes(this.creator_position_id);
  }

  get fromName() {
    if (this.isSenderRBS) {
      return 'Ranger Broadcast System';
    }

    if (this.sender_person) {
      return this.sender_person.callsign;
    }

    if (this.sender_team) {
      return this.sender_team.callsign;
    }

    return this.message_from;
  }

  unreadReplyCount(personId) {
    let replies = 0;

    this.replies?.forEach((reply) => {
      if (reply.person_id === personId && reply.sender_person_id !== personId && !reply.delivered) {
        replies += 1;
      }
    });

    return replies;
  }

  isUnread(personId) {
    return this.person_id === personId && this.sender_person_id !== personId && !this.delivered;
  }

  get isTopMessage() {
    return !this.reply_to_id;
  }

  get lastReply() {
    return last(this.replies);
  }
}
