import Model, {attr} from '@ember-data/model';
import {service} from '@ember/service';
// eslint-disable-next-line ember/no-mixins
import PersonMixin from 'clubhouse/mixins/models/person';

export default class PersonModel extends PersonMixin(Model) {
  @service ajax;

  @attr('string') first_name;
  @attr('string') mi;
  @attr('string') last_name;
  @attr('string') email;
  @attr('boolean') is_bouncing;
  @attr('string') callsign;
  @attr('boolean') callsign_approved;
  @attr('string') callsign_pronounce;
  @attr('string') formerly_known_as;
  @attr('string') known_rangers;
  @attr('string') known_pnvs;
  @attr('string') status;
  @attr('boolean') vintage;
  @attr('string', {readOnly: true}) status_date;
  @attr('string', {readOnly: true}) date_verified;
  @attr('string', {readOnly: true}) create_date;
  @attr('boolean') active_next_event;
  @attr('boolean') on_site;
  @attr('boolean') has_reviewed_pi;   // pseudo field, write only
  @attr('string') reviewed_pi_at;
  @attr('string') pi_reviewed_for_dashboard_at;
  @attr('string', {readOnly: true}) logged_in_at;
  @attr('string', {readOnly: true}) last_seen_at;

  @attr('number', {readOnly: true}) person_photo_id;

  @attr('boolean') used_vanity_change;
  @attr('string', { readOnly: true }) vanity_changed_at;

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

  @attr('string') pronouns;
  @attr('string') pronouns_custom;

  @attr('string') gender;

  @attr('number') long_sleeve_swag_ig;
  @attr('number') tshirt_swag_id;
  @attr('number') tshirt_secondary_swag_id;

  @attr('string') message;
  @attr('string') message_updated_at;

  // Emergency contact

  @attr('string') emergency_contact;

  @attr('boolean') vehicle_blacklisted;

  @attr('string') bpguid;

  @attr('string') lms_id;
  @attr('string') lms_username;

  @attr('boolean') behavioral_agreement;

  @attr('boolean') has_note_on_file;

  @attr('string', {readOnly: true}) timestamp;

  // a separate table the database and not
  // filled in when retrieving the person
  // however updated thru here.
  @attr('string') languages;

  @attr('string') sms_on_playa;
  @attr('string') sms_off_playa;
  @attr('boolean') sms_on_playa_verified;
  @attr('boolean') sms_off_playa_verified;
  @attr('boolean') sms_on_playa_stopped;
  @attr('boolean') sms_off_playa_stopped;
}


