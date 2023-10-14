import Route from '@ember/routing/route';

export default class ClientRoute extends Route {
  beforeModel() {
    this.replaceWith('/');
  }
}
