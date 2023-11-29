import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ClientRoute extends Route {
  @service router;

  beforeModel() {
    let uri = location.pathname.replace(/^\/client\/?/, '/');
    if (location.search) {
      uri += location.search;
    }
    this.router.replaceWith(uri);
  }
}
