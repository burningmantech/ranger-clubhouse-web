import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {Role} from 'clubhouse/constants/roles';

export default class MeMessagesRoute extends ClubhouseController {
  get shouldUseContactRanger() {
    return (!this.session.user.hasRole([Role.ADMIN, Role.MANAGE]) && this.session.user.isRanger);
  }
}
