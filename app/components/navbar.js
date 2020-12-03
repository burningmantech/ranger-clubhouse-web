import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class NavbarComponent extends Component {
  @service session;

  get user() {
    return this.session.user;
  }
}
