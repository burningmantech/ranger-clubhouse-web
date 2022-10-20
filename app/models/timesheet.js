import Model, { attr } from '@ember-data/model';
import { isEmpty } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import dayjs from 'dayjs';

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

  // Volunteer doing work on behalf of the Rangers, yet is not a Ranger. May earn (some) perks.
  @attr('boolean') is_non_ranger;

  @tracked isIgnoring = false; // Used by the HQ window interface
  @tracked selected = false;

  @tracked isOverlapping = false;

  // All good
  get isVerified() {
    return this.review_status === 'verified';
  }

  // Correction has been approved, still needs to be verified
  get isApproved() {
    return this.review_status === 'approved';
  }

  // Correction request has been rejected
  get isRejected() {
    return this.review_status === 'rejected';
  }

  // Pending review by the timesheet correction review team
  get isPending() {
    return this.review_status === 'pending';
  }

  // Timesheet has not been reviewed yet
  get isUnverified() {
    return (this.off_duty && this.review_status === 'unverified');
  }

  // Timesheet has not been reviewed yet
  get isCorrectionApproved() {
    return this.review_status === 'approved';
  }

  get haveReviewerResponse() {
    return this.review_status !== 'unverified' && !isEmpty(this.reviewer_notes);
  }

  get stillOnDuty() {
    return !this.off_duty;
  }

  get onDutyTime() {
    return dayjs(this.on_duty).unix();
  }

  get offDutyTime() {
    return this.off_duty ? dayjs(this.off_duty).unix() : (this.onDutyTime + this.duration);
  }
}
