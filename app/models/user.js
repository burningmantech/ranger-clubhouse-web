import PersonMixin from 'clubhouse/mixins/models/person';
import {ADMIN, VC, VIEW_EMAIL, VIEW_PII} from 'clubhouse/constants/roles';
import { typeOf } from '@ember/utils';

export default class UserModel extends PersonMixin(Object) {
  constructor(userInfo) {
    super();
    Object.assign(this, userInfo);
  }

  // Roles
  get isAdmin() {
    return this.hasRole(ADMIN);
  }

  get isVC() {
    return this.hasRole(VC);
  }

  canViewEmail() {
    return this.hasRole([ADMIN, VIEW_EMAIL, VIEW_PII]);
  }


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
  }

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
  }
}
