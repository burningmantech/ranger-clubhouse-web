import Model, { attr } from '@ember-data/model';
import { isEmpty } from '@ember/utils';
import { computed } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class TimesheetModel extends Model {
  @attr('number') person_id;
  @attr('number') position_id;
  @attr('number') slot_id;
  @attr('string', { readOnly: true }) position_title;
  @attr('shiftdate') on_duty;
  @attr('shiftdate') off_duty;
  @attr('string') review_status;
  @attr('date') reviewed_at;
  @attr('string') verified_at;
  @attr('number', { readOnly: true }) duration;
  @attr('number', { readOnly: true }) credits;

  @attr('string', { readOnly: true}) notes;
  @attr('string') additional_notes;
  @attr('string', { readOnly: true}) reviewer_notes;
  @attr('string') additional_reviewer_notes;

  @attr('', { readOnly: true}) verified_person;

  @attr('', { readOnly: true}) reviewer_person;
  @attr('', { readOnly: true}) position;
  @attr('', { readOnly: true}) slot;

  @tracked isIgnoring = false; // Used by the HQ window interface

  // All good
  @computed('review_status')
  get isVerified() {
    return this.review_status === 'verified';
  }

  // Correction has been approved, still needs to be verified
  @computed('review_status')
  get isApproved() {
    return this.review_status === 'approved';
  }

  // Correction request has been rejected
  @computed('review_status')
  get isRejected() {
    return this.review_status === 'rejected';
  }

  // Pending review by the timesheet correction review team
  @computed('review_status')
  get isPending() {
    return this.review_status === 'pending';
  }

  // Timesheet has not been reviewed yet
  @computed('review_status', 'isIgnoring', 'off_duty')
  get isUnverified() {
    return (this.off_duty && this.review_status === 'unverified');
  }

  @computed('review_status', 'reviewer_notes')
  get haveReviewerResponse() {
    return this.review_status !== 'unverified' && !isEmpty(this.reviewer_notes);
  }

  @computed('off_duty')
  get stillOnDuty() {
    return !this.off_duty;
  }
}
