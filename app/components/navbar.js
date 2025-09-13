import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class NavbarComponent extends Component {
  @service router;
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
    event.target.blur();
    this.session.showSearchDialog = true;
  }

  @action
  readMessages() {
    this.router.transitionTo('me.messages');
  }
}
