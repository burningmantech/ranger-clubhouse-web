import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class NavbarComponent extends Component {
  @service session;

  get user() {
    return this.session.user;
  }

  @action
  launchSearchDialog(event) {
    event.preventDefault();
    this.session.showSearchDialog = true;
  }
}
