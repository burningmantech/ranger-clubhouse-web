import DS from 'ember-data';
import { memberAction } from 'ember-api-actions';
import { attr } from '@ember-decorators/data';
import { service } from '@ember-decorators/service';
import PersonMixin from 'clubhouse/mixins/models/person';

import RSVP from 'rsvp';

export default class PersonModel extends DS.Model.extend(PersonMixin) {
  @service ajax;

  @attr('string') first_name;
  @attr('string') mi;
  @attr('string') last_name;
  @attr('string') email;
  @attr('string') callsign;
  @attr('boolean') callsign_approved;
  @attr('string') formerly_known_as;
  @attr('string') status;
  @attr('string') status_date;
  @attr('boolean') vintage;
  @attr('boolean') user_authorized;
  @attr('string') date_verified;
  @attr('string') create_date;
  @attr('boolean') active_next_event;
  @attr('boolean') on_site;

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
  @attr('string') birthdate;

  @attr('string') longsleeveshirt_size_style;
  @attr('string') teeshirt_size_style;


  // Emergency contact

  @attr('string') emergency_contact;
  @attr('string') em_first_name;
  @attr('string') em_mi;
  @attr('string') em_last_name;
  @attr('string') em_handle;
  @attr('string') em_home_phone;
  @attr('string') em_alt_phone;
  @attr('string') em_email;
  @attr('string') em_camp_location;

  @attr('string') barcode;
  @attr('boolean') asset_authorized;
  @attr('boolean') vehicle_blacklisted;
  @attr('boolean') vehicle_paperwork;
  @attr('boolean') vehicle_insurance_paperwork;
  @attr('string') lam_status;
  @attr('string') bpguid;
  @attr('string') sfuid;

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
   * retrieve years rangered, unread message count, and teacher info
   */

  loadRangerInfo() {
    const personUrl = `person/${this.id}/`;

    return RSVP.all([
      this.ajax.request(personUrl+'years').then((result) => { this.set('years',result.years); }),
      this.ajax.request(personUrl+'unread-message-count').then((result) => { this.set('unread_message_count',result.unread_message_count)}),
      this.ajax.request(personUrl+'teacher').then((result) => { this.set('teacher', result.teacher);})
    ])
  }

  //
  // AJAX methods
  //

  changePassword = memberAction({ path: 'password', type: 'patch'});

}
