import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class NavbarComponent extends Component {
  @service session;

  get user() {
    return this.session.user;
  }

  /**
   * Launch the search bar.
   *
   * @param {Event} event
   */

  @action
  launchSearchDialog(event) {
    event.preventDefault();
    event.target.blur();
    this.session.showSearchDialog = true;
  }
}
