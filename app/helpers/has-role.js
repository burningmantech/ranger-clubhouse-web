import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import { StringToRole } from 'clubhouse/constants/roles';
import { observer } from '@ember/object';
import { assert } from '@ember/debug';

export default Helper.extend({
  session: service(),

  compute(params) {
    const user = this.session.user;

    assert('has-role was not passed a role(s). Perhaps you forgot the ()\'s around the helper?', params.length > 0);

    if (!user) {
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
            if (!user.hasRole(roleValue)) {
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
          if (user.hasRole(roleValue)) {
            return true;
          }
        } else {
          assert(`Unknown role name [${name}]`);
        }
      }
    }

    return false;
  },

  rolesChanged: observer('session.user.roles', function() {
    this.recompute();
  })
});
