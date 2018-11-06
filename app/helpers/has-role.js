import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import { StringToRole } from 'clubhouse/constants/roles';
import { observer } from '@ember/object';
import { assert } from '@ember/debug';

export default Helper.extend({
  session: service(),

  compute(params) {
    const user = this.session.user;
    let roles = [];

    assert('has-role was not passed a role(s). Perhaps you forgot the ()\'s around the helper?', params.length > 0);

    if (!user) {
      return false;
    }

    params.forEach(function(name) {
      const roleValue = StringToRole[name];

      if (roleValue) {
        roles.push(roleValue);
      } else {
        assert(`Unknown role name [${name}]`);
      }
    });
    return user.hasRole(roles);
  },

  rolesChanged: observer('session.user.roles', function() {
    this.recompute();
  })
});
