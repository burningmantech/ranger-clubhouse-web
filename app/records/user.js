// eslint-disable-next-line ember/no-mixins
import PersonMixin from 'clubhouse/mixins/models/person';
import {tracked} from '@glimmer/tracking';

/**
 * The logged-in user.
 */

export default class UserModel extends PersonMixin(Object) {
  @tracked unread_message_count = 0;
  @tracked onduty_position = null;

  constructor(userInfo) {
    super();
    Object.assign(this, userInfo);
  }

  get allowVehicleDashboardAccess() {
    return this.motorpool_policy_enabled
      && (this.mvr_eligible || this.mvr_potential || this.pvr_eligible || this.pvr_potential);
  }
}
