import Helper from '@ember/component/helper';
import { service } from '@ember/service';
import { StringToRole } from 'clubhouse/constants/roles';
import { assert } from '@ember/debug';

export default class HasRole extends Helper {
  @service session;

  compute(params) {
    const session = this.session;

    assert('has-role was not passed a role(s). Perhaps you forgot the ()\'s around the helper?', params.length > 0);

    if (!session.user) {
      // No user logged in.
      return false;
    }

    const size = params.length;
    for (let i = 0; i < size; i++) {
      const name = params[i];

      if (name.indexOf('+') >= 0) {
        // Role combination has to occur together
        const comboRoles = name.split('+');
        let hasAll = true;

        const comboSize = comboRoles.length;
        for (let r = 0; r < comboSize; r++) {
          const comboName = comboRoles[r];
          const roleValue = StringToRole[comboName];

          if (roleValue) {
            if (!session.hasRole(roleValue)) {
              hasAll = false;
              break;
            }
          } else {
            assert(`Unknown role name [${comboName}]`);
          }
        }

        if (hasAll) {
          return true;
        }
      } else {
        const roleValue = StringToRole[name];

        if (roleValue) {
          if (session.hasRole(roleValue)) {
            return true;
          }
        } else {
          assert(`Unknown role name [${name}]`);
        }
      }
    }

    return false;
  }
}
