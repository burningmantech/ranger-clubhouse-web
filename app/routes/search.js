import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, EVENT_MANAGEMENT} from 'clubhouse/constants/roles';

export default class SearchRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, EVENT_MANAGEMENT];

  beforeModel(transition) {
    if (transition.targetName === 'search.index') {
      this.router.transitionTo('search.assets');
    }
  }
}
