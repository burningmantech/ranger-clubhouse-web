import Model, {attr} from '@ember-data/model';

export const APPROVED = 'approved';
export const REJECTED = 'rejected';
export const PENDING = 'pending';

export default class TimesheetMissingModel extends Model {
  @attr('number') person_id;
  @attr('number') position_id;
  @attr('shiftdate') off_duty;
  @attr('shiftdate') on_duty;
  @attr('string') partner;
  @attr('string') review_status;

  @attr('boolean') create_entry;
  @attr('shiftdate') new_on_duty;
  @attr('shiftdate') new_off_duty;
  @attr('number') new_position_id;

  @attr('', {readOnly: true}) admin_notes;
  @attr('', {readOnly: true}) notes;

  // Pseudo fields -- use to construct the timesheet notes.
  @attr('string') additional_notes;
  @attr('string') additional_admin_notes;
  @attr('string') additional_wrangler_notes;
  @attr('string') additional_worker_notes;

  @attr('number', {readOnly: true}) duration;
  @attr('', {readOnly: true}) position;
  @attr('', {readOnly: true}) reviewer_person;
  @attr('number', {readOnly: true}) credits;

  @attr('', {readOnly: true}) partner_info;

  get isPending() {
    return this.review_status === PENDING;
  }

  get isApproved() {
    return this.review_status === APPROVED;
  }

  get isRejected() {
    return this.review_status === REJECTED;
  }
}
