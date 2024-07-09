import {isEmpty} from '@ember/utils';
import {
  ACTIVE, ALPHA, AUDITOR, BONKED, DECEASED, DISMISSED, INACTIVE_EXTENSION, INACTIVE, NON_RANGER,
  PAST_PROSPECTIVE, PROSPECTIVE, PROSPECTIVE_WAITLIST, RESIGNED, RETIRED, SUSPENDED, UBERBONKED,
  ALLOWED_TO_WORK
} from 'clubhouse/constants/person_status';

const RANGER_STATUSES = [
  ACTIVE,
  INACTIVE,
  INACTIVE_EXTENSION,
  RETIRED
];

const PersonMixin = (superclass) => class extends superclass {
  get isActive() {
    return this.status === ACTIVE;
  }

  get isAlpha() {
    return this.status === ALPHA;
  }

  get isAuditor() {
    return this.status === AUDITOR;
  }

  get isDeceased() {
    return this.status === DECEASED;
  }

  get isDismissed() {
    return this.status === DISMISSED;
  }

  get isSuspended() {
    return this.status === SUSPENDED;
  }

  get isNonRanger() {
    return this.status === NON_RANGER;
  }

  get isProspective() {
    return this.status === PROSPECTIVE;
  }

  get isPastProspective() {
    return this.status === PAST_PROSPECTIVE;
  }

  get isProspectiveWaitlist() {
    return (this.status === PROSPECTIVE_WAITLIST);
  }

  get isPNV() {
    return (this.status === PROSPECTIVE || this.status === ALPHA);
  }

  get isRetired() {
    return (this.status === RETIRED);
  }

  get isResigned() {
    return (this.status === RESIGNED);
  }

  get isUberBonked() {
    return (this.status === UBERBONKED);
  }

  get isBonked() {
    return (this.status === BONKED);
  }

  get isRanger() {
    return RANGER_STATUSES.includes(this.status);
  }

  get isInactive() {
    return this.status === INACTIVE;
  }

  get canStartShift() {
    return ALLOWED_TO_WORK.includes(this.status);
  }

  get needsBpguid() {
    return (!this.isAuditor && !this.isNonRanger && isEmpty(this.bpguid));
  }

  get isCheetahCub() {
    const status = this.status;
    return status === INACTIVE_EXTENSION || status === RETIRED;
  }
}

export default PersonMixin;
