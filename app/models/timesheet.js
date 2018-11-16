import DS from 'ember-data';
import { attr } from '@ember-decorators/data';
import { computed } from '@ember-decorators/object';

export default class TimesheetModel extends DS.Model {
  @attr('number') person_id;
  @attr('number') position_id;
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

  @computed('verified', 'notes', 'review_status')
  get isPendingReview() {
    return (!this.verified && this.notes && this.review_status == 'pending');
  }

  @computed('review_status')
  get isApproved() {
    return this.review_status == 'approved';
  }

  @computed('review_status')
  get isRejected() {
    return this.review_status == 'rejected';
  }

  @computed('review_status')
  get isPending() {
    return this.review_status == 'pending';
  }

  @computed('verified', 'notes', 'status')
  get isUnverified() {
    return !this.verified && !this.notes && this.review_status == 'pending';
  }

  @computed('status', 'reviewer_notes')
  get haveReviewerResponse() {
    return this.review_status != 'pending' && this.reviewer_notes;
  }

  @computed('off_duty')
  get stillOnDuty() {
    return !this.off_duty;
  }
}
