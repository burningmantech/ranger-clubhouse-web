import DS from 'ember-data';
const { Model } = DS;
import { computed } from '@ember-decorators/object';
import { attr } from '@ember-decorators/data';

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
