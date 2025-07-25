import Model, {attr} from '@ember-data/model';
import {tracked} from '@glimmer/tracking';
import dayjs from 'dayjs';
import {TRAINING} from "clubhouse/constants/positions";
import durationOfTime from "clubhouse/utils/duration-of-time";

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
  [NOTE_TYPE_WRANGLER]: 'Timesheet Reviewer',
  [NOTE_TYPE_ADMIN]: 'Timesheet Reviewer',
};

export const BLOCKED_NOT_CHEETAH_CUB = 'not-cheetah-cub'; // Person is retired or inactive extension, and trying to work a non-cheetah cub shift.
export const BLOCKED_NOT_TRAINED = 'not-trained'; // Person is not trained. Either In-Person or ART.
export const BLOCKED_NO_BURN_PERIMETER_EXP = 'no-burn-perimeter-exp'; // Person has no burn perimeter experience
export const BLOCKED_NO_EMPLOYEE_ID = 'no-employee-id'; // Position is paid -- person does not have employee id on file.
export const BLOCKED_TOO_EARLY = 'too-early'; // Person is trying to sign in to a shift too early.
export const BLOCKED_TOO_LATE = 'too-late'; // Person is trying to sign in to a shift too late.
export const BLOCKED_UNSIGNED_SANDMAN_AFFIDAVIT = 'unsigned-sandman-affidavit'; // The Sandman Affidavit has not been signed.

// The following is from the timesheet_log table.
const VIA_BULK_UPLOAD = 'bulk-upload';  // Entry created via Bulk Uploader
const VIA_MISSING_ENTRY = 'missing-entry';  // Entry created via Missing Timesheet Request

const VIA_LABELS = {
  [VIA_MISSING_ENTRY]: 'missing request',
  [VIA_BULK_UPLOAD]: 'bulk upload',
}

export function createdVia(via) {
  return via ? (VIA_LABELS[via] ?? via) : 'check in';
}


export function buildBlockerLabels(blockers) {
  return blockers.map(b => {
    switch (b.blocker) {
      case BLOCKED_NOT_CHEETAH_CUB:
        return 'Because the person is either has an Inactive Extension or Retired status, they  must first complete a Cheetah Cub shift with the Mentors. After that, the Mentors will update their status to active if the person is deemed fix to return back to active status .';

      case BLOCKED_NOT_TRAINED:
        if (b.position.id === TRAINING) {
          return `${b.position.title} has not been passed. If the person attended a session today, the trainers may be delayed in recording the results. Contact the trainers to confirm if this person has passed.`;
        } else {
          return `${b.position.title} has not been passed. Radio the ART trainers to confirm this person has passed an ART session.`;
        }

      case BLOCKED_NO_BURN_PERIMETER_EXP:
        return `All Sandmen must have Burn Perimeter experience (Sandman, Burn Perimeter or similar) within the last ${b.within_years} years.`;

      case BLOCKED_NO_EMPLOYEE_ID:
        return 'Position is paid, and the person does not have an employee id on file.';

      case BLOCKED_TOO_EARLY:
        return `It's too early to check in for this shift, which starts at ${dayjs(b.slot.begins).format('HH:mm')} (${b.slot.description}). Check-in opens ${b.cutoff} minutes before. Recommend they return in ${durationOfTime(b.allowed_in)} or referred them to the HQ Lead if they insist on going on shift early.`;

      case BLOCKED_TOO_LATE:
        return `It's too late to check in. The shift started at ${dayjs(b.slot.begins).format('HH:mm')}, and check-in closes ${b.cutoff} minutes after the start. It's now ${durationOfTime(b.distance)} past the start. If they insist on going on shift, refer them to the HQ Lead.`;

      case BLOCKED_UNSIGNED_SANDMAN_AFFIDAVIT:
        return 'Person has not signed the Sandman Affidavit. Direct the person to the Kiosk Shack so they can log in and sign the affidavit.';

      default:
        return `Bug? Unknown blocker status [${b.blocker}]`;
    }
  });
}

export function buildBlockerAuditLabels(blockers) {
  return blockers.map(b => {
    switch (b.blocker) {
      case BLOCKED_NOT_CHEETAH_CUB:
        return 'Person is inactive extension or retired, non-Cheetah Cub shift attempted.';

      case 'is-retired':        // old blocker status superseded by the above
        return 'Person is retired';

      case BLOCKED_NOT_TRAINED:
        return `${b.position.title} not passed`;

      case BLOCKED_NO_BURN_PERIMETER_EXP:
        return `No Burn Perimeter exp. within  ${b.within_years} years.`;

      case BLOCKED_NO_EMPLOYEE_ID:
        return 'Position is paid, no employee id on file.';

      case BLOCKED_TOO_EARLY:
        return `Too early check-in. Shift start ${dayjs(b.slot.begins).format('HH:mm')}. ${b.cutoff} minutes before. Recommend return was ${durationOfTime(b.allowed_in)}.`

      case BLOCKED_TOO_LATE:
        return `Late check-in. Shift started at ${dayjs(b.slot.begins).format('HH:mm')}. ${durationOfTime(b.distance)} past the start. Cutoff ${b.cutoff} minutes.`;

      case BLOCKED_UNSIGNED_SANDMAN_AFFIDAVIT:
        return 'No signed Sandman Affidavit.';

      default:
        return `Bug? Unknown blocker status [${b.blocker}]`;
    }
  });
}

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
  @attr('boolean') is_echelon;

  // Suppress any too short / too long duration warnings
  @attr('boolean', {defaultValue: false}) suppress_duration_warning;

  @attr('boolean', {readOnly: true}) was_signin_forced;
  @attr('string') signin_force_reason;

  @attr('', {readOnly: true}) time_warnings;
  @attr('', {readOnly: true}) desired_warnings;


  @tracked isIgnoring = false; // Used by the HQ window interface
  @tracked selected = false;

  @tracked isOverlapping = false;

  @tracked showNotes;

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

  get timesOutsideRange() {
    return this.time_warnings?.status === 'out-of-range';
  }

  get desiredOutsideRange() {
    return this.desired_warnings?.status === 'out-of-range';
  }
}
