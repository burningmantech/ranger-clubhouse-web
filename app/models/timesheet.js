import Model, {attr} from '@ember-data/model';
import {tracked} from '@glimmer/tracking';
import dayjs from 'dayjs';

export const STATUS_PENDING = 'pending';
export const STATUS_APPROVED = 'approved';
export const STATUS_REJECTED = 'rejected';
export const STATUS_VERIFIED = 'verified';
export const STATUS_UNVERIFIED = 'unverified';

export const NOTE_TYPE_USER = 'user';
export const NOTE_TYPE_HQ_WORKER = 'hq-worker';
export const NOTE_TYPE_WRANGLER = 'wrangler';
export const NOTE_TYPE_ADMIN = 'admin';

export const TOO_SHORT_DURATION = (15 * 60);

export const NoteTypeLabels = {
  [NOTE_TYPE_USER]: 'User',
  [NOTE_TYPE_HQ_WORKER]: 'HQ Worker',
  [NOTE_TYPE_WRANGLER]: 'Timesheet Wrangler',
  [NOTE_TYPE_ADMIN]: 'Admin',
};

export default class TimesheetModel extends Model {
  @attr('number') person_id;
  @attr('number') position_id;
  @attr('number') slot_id;
  @attr('string', {readOnly: true}) position_title;
  @attr('shiftdate') on_duty;
  @attr('shiftdate') off_duty;
  @attr('string') review_status;
  @attr('date') reviewed_at;
  @attr('string') verified_at;
  @attr('number', {readOnly: true}) duration;
  @attr('number', {readOnly: true}) credits;

  @attr('number') desired_position_id;
  @attr('shiftdate') desired_off_duty;
  @attr('shiftdate') desired_on_duty;

  @attr('', {readOnly: true}) desired_position;

  @attr('', {readOnly: true}) admin_notes;
  @attr('', {readOnly: true}) notes;

  // Pseudo fields -- use to construct the timesheet notes.
  @attr('string') additional_notes;
  @attr('string') additional_admin_notes;
  @attr('string') additional_wrangler_notes;
  @attr('string') additional_worker_notes;

  @attr('', {readOnly: true}) verified_person;

  @attr('', {readOnly: true}) reviewer_person;
  @attr('', {readOnly: true}) position;
  @attr('', {readOnly: true}) slot;

  // Volunteer doing work on behalf of the Rangers, yet is not a Ranger. May earn (some) perks.
  @attr('boolean') is_non_ranger;

  // Suppress any too short / too long duration warnings
  @attr('boolean', {defaultValue: false}) suppress_duration_warning;

  @attr('boolean', {readOnly: true}) was_signin_forced;

  @tracked isIgnoring = false; // Used by the HQ window interface
  @tracked selected = false;

  @tracked isOverlapping = false;

  // All good
  get isVerified() {
    return this.review_status === STATUS_VERIFIED;
  }

  // Correction has been approved, still needs to be verified
  get isApproved() {
    return this.review_status === STATUS_APPROVED;
  }

  // Correction request has been rejected
  get isRejected() {
    return this.review_status === STATUS_REJECTED;
  }

  // Pending review by the timesheet correction review team
  get isPending() {
    return this.review_status === STATUS_PENDING;
  }

  // Timesheet has not been reviewed yet
  get isUnverified() {
    return (this.off_duty && this.review_status === STATUS_UNVERIFIED);
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

  get isTooShort() {
    return (this.off_duty && this.duration < TOO_SHORT_DURATION);
  }

  get isTooLong() {
    return (this.off_duty && this.slot && (this.slot.duration * 1.5) < this.duration);
  }
}
