import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class NavbarComponent extends Component {
  @service session;

  get user() {
    return this.session.user;
  }
}
