import {Role} from 'clubhouse/constants/roles';
import {typeOf, isEmpty} from '@ember/utils';
import Mixin from '@ember/object/mixin';
import {
  ACTIVE, ALPHA, AUDITOR, BONKED, DECEASED, DISMISSED, INACTIVE_EXTENSION, INACTIVE, NON_RANGER,
  PAST_PROSPECTIVE, PROSPECTIVE, PROSPECTIVE_WAITLIST, RESIGNED, RETIRED, SUSPENDED, UBERBONKED
} from 'clubhouse/constants/person_status';

// eslint-disable-next-line ember/no-new-mixins
const PersonMixin = Mixin.create({
  get isActive() {
    return this.status === ACTIVE;
  },

  get isAlpha() {
    return this.status === ALPHA;
  },

  get isAuditor() {
    return this.status === AUDITOR;
  },

  get isDeceased() {
    return this.status === DECEASED;
  },

  get isDismissed() {
    return this.status === DISMISSED;
  },

  get isSuspended() {
    return this.status === SUSPENDED;
  },

  get isNonRanger() {
    return this.status === NON_RANGER;
  },

  get isProspective() {
    return this.status === PROSPECTIVE;
  },

  get isPastProspective() {
    return this.status === PAST_PROSPECTIVE;
  },

  get isProspectiveWaitlist() {
    return (this.status === PROSPECTIVE_WAITLIST);
  },

  get isPNV() {
    return (this.status === PROSPECTIVE || this.status === ALPHA);
  },

  get isResigned() {
    return (this.status === RESIGNED);
  },

  get isUberBonked() {
    return (this.status === UBERBONKED);
  },

  get isBonked() {
    return (this.status === BONKED);
  },

  get isNotRanger() {
    const status = this.status;

    return (status === AUDITOR ||
      status === ALPHA ||
      status === BONKED ||
      status === PROSPECTIVE ||
      status === PAST_PROSPECTIVE ||
      status === PROSPECTIVE_WAITLIST);
  },

  get isRanger() {
    return (!this.isNotRanger && this.status !== NON_RANGER);
  },

  get canStartShift() {
    const status = this.status;
    return (
      status === ACTIVE ||
      status === ALPHA ||
      status === INACTIVE ||
      status === INACTIVE_EXTENSION ||
      status === RETIRED ||
      status === NON_RANGER
    );
  },

  get needsBpguid() {
    return (!this.isAuditor && !this.isNonRanger && isEmpty(this.bpguid));
  },

  get isCheetahCub() {
    const status = this.status;
    return status === INACTIVE_EXTENSION || status === RETIRED;
  },

  hasRole(roles) {
    let personRoles = this.roles;

    if (!personRoles) {
      return false;
    }

    if (typeOf(roles) !== 'array') {
      roles = [roles];
    }

    let haveIt = false;

    roles.forEach((role) => {
      const type = typeOf(role);
      if (type === 'array' || type === 'object') {
        let haveAll = true;

        // Sub array means ALL the roles have to be present.
        role.forEach((r) => {
          if (!role) {
            throw new Error('hasRole: Unknown role - is the name spelled correctly?');
          }

          if (!personRoles.includes(r)) {
            haveAll = false;
          }
        });

        if (haveAll) {
          haveIt = true;
        }
      } else {
        if (!role) {
          throw new Error('hasRole: Unknown role - is the name spelled correctly?');
        }
        if (personRoles.includes(role)) {
          haveIt = true;
        }
      }
    })

    return haveIt;
  },

  hasAllRoles(roles) {
    let personRoles = this.roles;

    if (!personRoles) {
      return false;
    }

    if (typeOf(roles) !== 'array') {
      roles = [roles];
    }

    const found = roles.filter((r) => personRoles.includes(r));

    return (found.length === roles.length);
  },

  // Roles
  get isAdmin() {
    return this.hasRole(Role.ADMIN);
  },

  get isVC() {
    return this.hasRole(Role.VC);
  },

  canViewEmail() {
    return this.hasRole([Role.ADMIN, Role.VIEW_EMAIL, Role.VIEW_PII]);
  }

});

export default PersonMixin;
