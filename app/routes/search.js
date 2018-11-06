import Route from '@ember/routing/route';

export default class SearchRoute extends Route {
  beforeModel(transition) {
    if (transition.targetName == 'search.index') {
      this.transitionTo('search.person');
    }
  }
}
