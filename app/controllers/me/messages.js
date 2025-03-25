import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {Role} from 'clubhouse/constants/roles';

export default class MeMessagesRoute extends ClubhouseController {
  get shouldUseContactRanger() {
    return (!this.session.hasRole([Role.ADMIN, Role.EVENT_MANAGEMENT]) && this.session.user.isRanger);
  }
}
