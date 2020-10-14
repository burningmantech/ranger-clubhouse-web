import Model, { attr } from '@ember-data/model';
import { isEmpty } from '@ember/utils';
import { computed } from '@ember/object';

export default class TimesheetModel extends Model {
  @attr('number') person_id;
  @attr('number') position_id;
  @attr('number') slot_id;
  @attr('string', { readOnly: true }) position_title;
  @attr('shiftdate') on_duty;
  @attr('shiftdate') off_duty;
  @attr('string') review_status;
  @attr('string') reviewer_notes;
  @attr('date') reviewed_at;
  @attr('number', { readOnly: true }) duration;
  @attr('number', { readOnly: true }) credits;

  @attr('string') notes;
  @attr('boolean') verified;
  @attr('string') verified_at;

  @attr('', { readOnly: true}) verified_person;
  @attr('', { readOnly: true}) reviewer_person;
  @attr('', { readOnly: true}) position;
  @attr('', { readOnly: true}) slot;

  isIgnoring = false; // Used the HQ window interface

  @computed('verified', 'notes', 'review_status')
  get isPendingReview() {
    return (!this.verified && !isEmpty(this.notes) && this.review_status === 'pending');
  }

  @computed('review_status')
  get isApproved() {
    return this.review_status === 'approved';
  }

  @computed('review_status')
  get isRejected() {
    return this.review_status === 'rejected';
  }

  @computed('review_status')
  get isPending() {
    return this.review_status === 'pending';
  }

  @computed('verified', 'notes', 'review_status', 'off_duty', 'isIgnoring')
  get isUnverified() {
    return (this.off_duty && !this.isIgnoring && !this.verified && isEmpty(this.notes) && this.review_status === 'pending');
  }

  @computed('review_status', 'reviewer_notes', 'status')
  get haveReviewerResponse() {
    return this.review_status !== 'pending' && !isEmpty(this.reviewer_notes);
  }

  @computed('off_duty')
  get stillOnDuty() {
    return !this.off_duty;
  }
}
