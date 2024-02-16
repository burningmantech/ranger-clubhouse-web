import Model, {attr} from '@ember-data/model';
import {isEmpty} from "lodash";
import optionsToLabels from "clubhouse/utils/options-to-labels";
import {
  ACTIVE,
  INACTIVE,
  INACTIVE_EXTENSION,
  PAST_PROSPECTIVE,
  RETIRED,
  UBERBONKED
} from "clubhouse/constants/person_status";
import currentYear from "clubhouse/utils/current-year";
import _ from 'lodash';

export const EXPERIENCE_BRC1R1 = 'brc1r1';
export const EXPERIENCE_BRC2 = 'brc2';
export const EXPERIENCE_NONE = 'none';

export const ExperienceLabels = {
  [EXPERIENCE_NONE]: 'None',
  [EXPERIENCE_BRC1R1]: 'BRC1 + R1',
  [EXPERIENCE_BRC2]: 'BRC2'
};

export const STATUS_PENDING = 'pending';
export const STATUS_APPROVED = 'approved';
export const STATUS_APPROVED_PII_ISSUE = 'approved-pii-issue';
export const STATUS_CREATED = 'created';

export const STATUS_REASON_ISSUE = 'reason-issue';

export const STATUS_HANDLE_CHECK = 'handle-check';
export const STATUS_MORE_HANDLES = 'more-handles';

export const STATUS_HOLD_QUALIFICATION_ISSUE = 'qualification-issue';
export const STATUS_HOLD_RRN_CHECK = 'rrn-check';

export const STATUS_REJECT_PRE_BONK = 'reject-pre-bonk';
export const STATUS_REJECT_UBERBONKED = 'reject-uber-bonked';
export const STATUS_REJECT_TOO_YOUNG = 'reject-too-young';
export const STATUS_REJECT_UNQUALIFIED = 'reject-unqualified';
export const STATUS_REJECT_REGIONAL = 'reject-regional';

export const STATUS_DUPLICATE = 'duplicate';

export const STATUS_REJECT_RETURNING_RANGER = 'reject-returning-ranger';

export const WHY_VOLUNTEER_REVIEW_OKAY = 'okay';
export const WHY_VOLUNTEER_REVIEW_PROBLEM = 'problem';
export const WHY_VOLUNTEER_REVIEW_UNREVIEWED = 'unreviewed';

export const StatusOptions = [
  ['Approved - Awaiting Account Creation', STATUS_APPROVED],
  ['Approved - Personal Info Issue', STATUS_APPROVED_PII_ISSUE],
  ['Duplicate Application', STATUS_DUPLICATE],
  ['In Callsign Processing', STATUS_HANDLE_CHECK],
  ['Account Created', STATUS_CREATED],
  ['More Handles Requested', STATUS_MORE_HANDLES],
  ['Pending - Awaiting Review', STATUS_PENDING],
  ['Awaiting Qualification Confirmation', STATUS_HOLD_QUALIFICATION_ISSUE],
  ['Hold - Why Ranger Answer Issue', STATUS_REASON_ISSUE],
  ['Rejected - Pre-Bonked', STATUS_REJECT_PRE_BONK],
  ['Rejected - Failed Regional Verification', STATUS_REJECT_REGIONAL],
  ['Rejected - Too Young', STATUS_REJECT_TOO_YOUNG],
  ['Rejected - Uberbonked', STATUS_REJECT_UBERBONKED],
  ['Rejected - Lacking Event Experience', STATUS_REJECT_UNQUALIFIED],
  ['Rejected - Returning Ranger', STATUS_REJECT_RETURNING_RANGER],
  ['Awaiting RRN Verification', STATUS_HOLD_RRN_CHECK],
];

export const StatusLabels = optionsToLabels(StatusOptions);

export const StatusColors = {
  [STATUS_APPROVED]: 'text-bg-success',
  [STATUS_APPROVED_PII_ISSUE]: 'text-bg-warning',
  [STATUS_DUPLICATE]: 'text-bg-danger',
  [STATUS_HANDLE_CHECK]: 'text-bg-gray',
  [STATUS_CREATED]: 'text-bg-success',
  [STATUS_MORE_HANDLES]: 'text-bg-warning',
  [STATUS_PENDING]: 'text-bg-info',
  [STATUS_HOLD_QUALIFICATION_ISSUE]: 'text-bg-warning',
  [STATUS_REASON_ISSUE]: 'text-bg-warning',
  [STATUS_REJECT_PRE_BONK]: 'text-bg-danger',
  [STATUS_REJECT_REGIONAL]: 'text-bg-danger',
  [STATUS_REJECT_TOO_YOUNG]: 'text-bg-danger',
  [STATUS_REJECT_UBERBONKED]: 'text-bg-danger',
  [STATUS_REJECT_UNQUALIFIED]: 'text-bg-danger',
  [STATUS_REJECT_RETURNING_RANGER]: 'text-bg-danger',
  [STATUS_HOLD_RRN_CHECK]: 'text-bg-warning',
};

export const WhyVolunteerReviewLabels = {
  [WHY_VOLUNTEER_REVIEW_OKAY]: 'Okay',
  [WHY_VOLUNTEER_REVIEW_PROBLEM]: 'Problem',
  [WHY_VOLUNTEER_REVIEW_UNREVIEWED]: 'Unreviewed'
};

export const ColumnLabels = {
  status: 'Status',
  events_attended: 'Events Attended',
  first_name: 'First Name',
  last_name: 'Last Name',
  year: 'Event Year',
  email: 'Email',
  bpguid: 'BPGUID',
  is_over_18: 'Is Over 18?',
  why_volunteer: 'Why Ranger?',
  why_volunteer_review: 'Why Ranger Review',
  reviewed_at: 'Reviewed At',
  known_rangers: 'Known Rangers',
  known_applicants: 'Known Applicants',
  handles: 'Handles',
  approved_handle: 'Approved Handle',
  regional_experience: 'Regional Experience',
  regional_callsign: 'Regional Callsign',
  experience: 'Experience',

  street: 'Street',
  city: 'City',
  state: 'State',
  postal_code: 'Postal Code',
  country: 'Country',
  phone: 'Phone',

  emergency_contact: 'Emergency Contact',

  assigned_person_id: 'Assigned Person',

  // Pseudo columns, only exists in the audit logs.
  salesforce_status: 'Salesforce Status',
  salesforce_type: 'Application Type',
};

export const BadHandleRegexps = [
  [/^\d\s*[.)-]?\s*\b/, 'Priority indicators detected (e.g., 1., 2), 3 -, etc) - remove the indicators.'],
  [/\branger\b/i, 'The word "Ranger" detected - remove the word.'],
    [/[,."'!&-]/, 'Punctuation (commas, periods, quotes, ampersands, exclamations) detected - remove all punctuations. Dashes are okay IF its part of the actual handle'],
];
export default class ProspectiveApplicationModel extends Model {
  @attr('string', {defaultVault: STATUS_PENDING}) status;

  @attr('string') events_attended;
  @attr('string') salesforce_name;
  @attr('string') salesforce_id;
  @attr('string') sfuid;
  @attr('string') first_name;
  @attr('string') last_name;
  @attr('number') year;
  @attr('string') email;
  @attr('string') bpguid;
  @attr('number') person_id;
  @attr('boolean') is_over_18;
  @attr('string') why_volunteer;
  @attr('string') why_volunteer_review;
  @attr('string') reviewed_at;
  @attr('string') known_rangers;
  @attr('string') known_applicants;
  @attr('string') handles;
  @attr('string') approved_handle;
  @attr('', {readOnly: true}) rejected_handles;
  @attr('string') regional_experience;
  @attr('string') regional_callsign;
  @attr('string') experience;

  @attr('string') street;
  @attr('string') city;
  @attr('string') state;
  @attr('string') postal_code;
  @attr('string') country;
  @attr('string') phone;

  @attr('number') review_person_id;
  @attr('') review_person;

  @attr('string') emergency_contact;

  @attr('number') assigned_person_id;
  @attr('', {readOnly: true}) assigned_person;

  @attr('string', {readOnly: true}) updated_by_person_at;
  @attr('number', {readOnly: true}) updated_by_person_id;
  @attr('', {readOnly: true}) updated_by_person;

  @attr('string', {readOnly: true}) updated_at;
  @attr('string', {readOnly: true}) created_at;

  @attr('', {readOnly: true}) person;
  @attr('', {readOnly: true}) bpguid_person;
  @attr('', {readOnly: true}) audit_logs;
  @attr('', {readOnly: true}) mail_logs;
  @attr('', {readOnly: true}) notes;
  @attr('', {readOnly: true}) screened_handles;

  get hasStopStatus() {
    return this.status === STATUS_REJECT_PRE_BONK
      || this.status === STATUS_REJECT_UBERBONKED
      || this.status === STATUS_REJECT_UNQUALIFIED
      || this.status === STATUS_REJECT_TOO_YOUNG
      || this.status === STATUS_REJECT_REGIONAL
      || this.status === STATUS_REJECT_RETURNING_RANGER
      || this.status === STATUS_DUPLICATE
      ;
  }

  get hasHeldStatus() {
    return this.status === STATUS_HOLD_QUALIFICATION_ISSUE
      || this.status === STATUS_MORE_HANDLES
      || this.status === STATUS_REASON_ISSUE
      || this.status === STATUS_HOLD_RRN_CHECK;
  }

  get eventsList() {
    const {events_attended} = this;
    return isEmpty(events_attended) ? [] : events_attended.split(';').map((y) => +y);
  }

  get qualifiedEvents() {
    return this.eventsList.filter((e) => (e !== 2020 && e !== 2021));
  }

  get hasPandemicEvents() {
    return this.eventsList.find((e) => (e === 2020 || e === 2021));
  }

  get hasEventYearWithinRange() {
    const recent = currentYear() - 10;

    return this.qualifiedEvents.find((e) => e >= recent);
  }

  get experienceLabel() {
    return ExperienceLabels[this.experience] ?? `Bug: Unknown Experience [${this.experience}]`;
  }

  get isBRC1R1() {
    return this.experience === EXPERIENCE_BRC1R1;
  }

  get isStatusHandleCheck() {
    return this.status === STATUS_HANDLE_CHECK;
  }

  get isStatusMoreHandles() {
    return this.status === STATUS_MORE_HANDLES;
  }

  get isStatusDuplicate() {
    return this.status === STATUS_DUPLICATE;
  }

  get isStatusCreated() {
    return this.status === STATUS_CREATED;
  }

  get isStatusApproved() {
    return this.status === STATUS_APPROVED;
  }

  get isProcessingCallsign() {
    return this.status === STATUS_HANDLE_CHECK || this.status === STATUS_MORE_HANDLES;
  }

  get isStatusPending() {
    return this.status === STATUS_PENDING;
  }

  get isStatusApprovedPiiIssue() {
    return this.status === STATUS_APPROVED_PII_ISSUE
  }

  get isBonked() {
    return this.status === STATUS_REJECT_PRE_BONK || this.status === STATUS_REJECT_UBERBONKED;
  }

  get statusLabel() {
    return StatusLabels[this.status] ?? `Bug [${this.status}]`;
  }

  get experienceIssue() {
    switch (this.experience) {
      case EXPERIENCE_NONE:
        return 'NO BRC OR REGIONAL EXPERIENCE';

      case EXPERIENCE_BRC2:
        if (this.qualifiedEvents.length < 2) {
          return 'LESS THAN TWO BRC QUALIFIED EVENTS';
        } else if (!this.hasEventYearWithinRange) {
          return 'NO EVENT YEAR WITHIN THE LAST 10';
        } else {
          return null;
        }
      case EXPERIENCE_BRC1R1:
        if (!this.qualifiedEvents.length) {
          return 'NO BRC EVENTS';
        } else if (!this.hasEventYearWithinRange) {
          return 'NO EVENT YEAR WITHIN THE LAST 10';
        } else if (isEmpty(this.regional_experience)) {
          return 'NO REGIONAL EXP. LISTED';
        }

        return null;

      default:
        return null;
    }
  }

  get isBRCExperienceOkay() {
    switch (this.experience) {
      case EXPERIENCE_BRC1R1:
        return this.qualifiedEvents.length > 0 && this.hasEventYearWithinRange;

      case EXPERIENCE_BRC2:
        return this.qualifiedEvents.length >= 2 && this.hasEventYearWithinRange;

      default:
        return false;
    }
  }

  get handlesList() {
    return this.handles.split("\n");
  }

  get applicationId() {
    return `A-${this.id}`;
  }

  get eventYears() {
    return this.events_attended.split(';').map((y) => +y);
  }

  set eventYears(years) {
    this.events_attended = years.join(';');
  }

  get isReturningApplicant() {
    return this.existingAccount?.status === PAST_PROSPECTIVE;
  }

  get existingAccount() {
    return this.person ?? this.bpguid_person;
  }

  get wasUberbonkedPreviously() {
    return this.existingAccount?.status === UBERBONKED;
  }

  get isReturningRanger() {
    const status = this.existingAccount?.status;

    return status === ACTIVE || status === INACTIVE || status === INACTIVE_EXTENSION || status === RETIRED;
  }

  get whyVolunteerReviewLabel() {
    return WhyVolunteerReviewLabels[this.why_volunteer_review] ?? `Bug [${this.why_volunteer_review}]`;
  }

  get hasPersonalInfoIssues() {
    let haveIssues = false;
    ['street', 'city', 'postal_code', 'country', 'phone'].forEach((field) => {
      if (_.isEmpty(this[field])) {
        haveIssues = true;
      }
    });

    if (['US', 'CA', 'AU'].includes(this.country) && _.isEmpty(this.state)) {
      haveIssues = true;
    }

    return haveIssues;
  }

  get handleListIssues() {
    const issues = [];

     BadHandleRegexps.forEach((regexp) => {
       if (this.handles.match(regexp[0])) {
         issues.push(regexp[1]);
       }
     });

     return issues;
  }
}
