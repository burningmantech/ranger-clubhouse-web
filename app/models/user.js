// eslint-disable-next-line ember/no-mixins
import PersonMixin from 'clubhouse/mixins/models/person';
import { tracked } from '@glimmer/tracking';

/**
 * The logged in user.
 */

export default class UserModel extends PersonMixin(Object) {
  @tracked unread_message_count = 0;

  constructor(userInfo) {
    super();
    Object.assign(this, userInfo);
  }
}
