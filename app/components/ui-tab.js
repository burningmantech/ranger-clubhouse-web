import BsTab from 'ember-bootstrap/components/bs-tab';
import {action} from '@ember/object';
import {service} from '@ember/service';

/**
 * Extend the <BsTab /> component to fix a link bug.
 */

export default class UiTabComponent extends BsTab {
  @service house;
  @service router;

  @action
  select(id, event) {
    if (event) {
      event.preventDefault();
    }

    const {checkTabNavigation} = this;
    if (checkTabNavigation) {
      checkTabNavigation(this.isActiveId, id, () => this._continueSelect(id));
    } else {
      this._continueSelect(id);
    }
  }

  _continueSelect(id) {
    super.select(id);

    // Record when the user clicks on a tab.
    const pane = this.childPanes.find((pane) => pane.id === this.isActiveId);
    const url = window.location.pathname;
    const tab_title = pane ? pane.title : 'unknown';
    this.house.actionRecord('client-route-tab', {
      url,
      tab_title,
      tab_id: this.isActiveId
    }, `${url}#${this.isActiveId}`);
  }
}
