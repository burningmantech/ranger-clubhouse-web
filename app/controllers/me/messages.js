import Controller from '@ember/controller';
import {Role} from 'clubhouse/constants/roles';

export default class MeMessagesRoute extends Controller {
  get shouldUseContactRanger() {
    return (!this.session.user.hasRole([Role.ADMIN, Role.MANAGE]) && this.session.user.isRanger);
  }
}
