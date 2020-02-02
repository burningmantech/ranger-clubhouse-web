import DS from 'ember-data';
const { attr } = DS;
import { inject as service } from '@ember/service';
import PersonMixin from 'clubhouse/mixins/models/person';

export default class PersonModel extends DS.Model.extend(PersonMixin) {
  @service ajax;

  @attr('string') first_name;
  @attr('string') mi;
  @attr('string') last_name;
  @attr('string') email;
  @attr('string') callsign;
  @attr('boolean') callsign_approved;
  @attr('string') callsign_pronounce;
  @attr('string') formerly_known_as;
  @attr('string') status;
  @attr('boolean') vintage;
  @attr('string', { readOnly: true }) status_date;
  @attr('boolean') user_authorized;
  @attr('string', { readOnly: true }) date_verified;
  @attr('string', { readOnly: true }) create_date;
  @attr('boolean') active_next_event;
  @attr('boolean') on_site;
  @attr('boolean') has_reviewed_pi;
  @attr('string', { readOnly: true }) logged_in_at;
  @attr('string', { readOnly: true }) last_seen_at;

  @attr('number', { readOnly: true}) person_photo_id;

  @attr('', { readOnly: true}) roles;

  // Personal Information
  @attr('string') street1;
  @attr('string') street2;
  @attr('string') apt;
  @attr('string') city;
  @attr('string') state;
  @attr('string') zip;
  @attr('string') country;
  @attr('string') home_phone;
  @attr('string') alt_phone;

  @attr('string') camp_location;
  @attr('string') gender;

  @attr('string') longsleeveshirt_size_style;
  @attr('string') teeshirt_size_style;

  @attr('string') message;
  @attr('string') message_updated_at;

  // Emergency contact

  @attr('string') emergency_contact;

  @attr('boolean') asset_authorized;
  @attr('boolean') vehicle_blacklisted;
  @attr('boolean') vehicle_paperwork;
  @attr('boolean') vehicle_insurance_paperwork;

  @attr('string') bpguid;
  @attr('string') sfuid;

  @attr('boolean') behavioral_agreement;
  @attr('boolean') sandman_affidavit;

  @attr('boolean') osha10;
  @attr('boolean') osha30;

  @attr('boolean') mentors_flag;
  @attr('string') mentors_flag_note;
  @attr('string') mentors_notes;
  @attr('boolean') has_note_on_file;

  @attr('string') timestamp;

  // a seperate table the database and not
  // filled in when retrieving the person
  // however updated thru here.
  @attr('string') languages;

  @attr('string') sms_on_playa;
  @attr('string') sms_off_playa;
  @attr('boolean') sms_on_playa_verified;
  @attr('boolean') sms_off_playa_verified;
  @attr('boolean') sms_on_playa_stopped;
  @attr('boolean') sms_off_playa_stopped;

  /*
   * retrieve years rangered, unread message count, and teacher info, everything
   * needed to show the user home page.
   */

  loadUserInfo() {
    return this.ajax.request(`person/${this.id}/user-info`).then((result) => {
      this.setProperties(result.user_info);
    });
  }
}
