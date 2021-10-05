import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, MANAGE} from 'clubhouse/constants/roles';

export default class SearchRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, MANAGE];

  beforeModel(transition) {
    if (transition.targetName === 'search.index') {
      this.router.transitionTo('search.assets');
    }
  }
}
