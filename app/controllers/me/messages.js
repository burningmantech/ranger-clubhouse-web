import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';

export default class MeMessagesRoute extends ClubhouseController {
  get mayNotUse() {
    const {user} = this.session;

    return !user.isActive && !user.isInactive && !user.isInactiveExtension;
  }
}
