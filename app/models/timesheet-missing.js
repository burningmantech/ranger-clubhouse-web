import DS from 'ember-data';
const { Model } = DS;
import { computed } from '@ember/object';
const { attr } = DS;

export default class TimesheetMissingModel extends Model {
  @attr('number') person_id;
  @attr('number') position_id;
  @attr('shiftdate') off_duty;
  @attr('shiftdate') on_duty;
  @attr('string') notes;
  @attr('string') partner;

  @attr('string') review_status;
  @attr('string') reviewer_notes;

  @attr('number', { readOnly: true }) duration;
  @attr('', { readOnly: true}) position;
  @attr('', { readOnly: true}) reviewer_person;
  @attr('number', { readOnly: true }) credits;

  @attr('', { readOnly: true }) partner_info;

  @attr('boolean') create_entry;
  @attr('shiftdate') new_on_duty;
  @attr('shiftdate') new_off_duty;
  @attr('number') new_position_id;

  @computed('review_status')
  get isPending() {
    return this.review_status == 'pending';
  }

  @computed('review_status')
  get isApproved() {
    return this.review_status == 'approved';
  }

  @computed('review_status')
  get isRejected() {
    return this.review_status == 'rejected';
  }

}
