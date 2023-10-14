import Route from '@ember/routing/route';

export default class ClientRoute extends Route {
  beforeModel() {
    let uri = location.pathname.replace(/^\/client\/?/, '/');
    if (location.search) {
      uri += location.search;
    }
    this.replaceWith(uri);
  }
}
